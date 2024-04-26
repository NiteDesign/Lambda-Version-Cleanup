const {
    LambdaClient,
    ListFunctionsCommand,
    ListVersionsByFunctionCommand,
    DeleteFunctionCommand,
    ListAliasesCommand,
  } = require('@aws-sdk/client-lambda');

const {
    pruneVersionsByVersion,
    listFilteredLambdaFunctions,
    listAliases
} = require('../lambda-version-pruning');

  const minimist = require('minimist');

  jest.mock('@aws-sdk/client-lambda');
  jest.mock('minimist');

// Mocking ListAliasesCommand response correctly
LambdaClient.prototype.send = jest.fn().mockImplementation(command => {
    if (command instanceof ListAliasesCommand) {
        return Promise.resolve({ Aliases: [{ FunctionVersion: '1' }, { FunctionVersion: '2' }] });
    }
    // Handle other command types similarly
    return Promise.resolve();
});

// Import your functions here if they are exported, or redefine them in the test file
  describe('listFilteredLambdaFunctions', () => {
      beforeEach(() => {
          jest.resetModules();  // Resets the module registry - the cache of all required modules. This is useful to isolate modules where local state might conflict between tests.
          jest.clearAllMocks(); // Clears all mocks so that interactions in one test do not interfere with another.

          jest.mock('minimist', () => jest.fn().mockReturnValue({
              envStage: '-dev',
              keepLastN: '5',
              latestDate: '2022-12-31'
          }));
      });

      it('should return filtered function names', async () => {
      const mockFunctions = {
        Functions: [{ FunctionName: 'dev-testFunc1' }, { FunctionName: 'prod-testFunc2' }],
        NextMarker: null
      };
      LambdaClient.prototype.send = jest.fn().mockResolvedValue(mockFunctions);

      const filterCriteria = 'dev-';
      const expected = ['dev-testFunc1'];
      const result = await listFilteredLambdaFunctions(filterCriteria);
      expect(result).toEqual(expected);
    });

    it('should handle function versions correctly', async () => {
      // Setup mocks
      jest.spyOn(global.console, 'log');  // Spy on console.log but prevent actual logging
      LambdaClient.prototype.send.mockResolvedValueOnce({
          Aliases: [{ FunctionVersion: '1' }]
      }).mockResolvedValueOnce({
          Versions: [{ Version: '1', LastModified: '2020-01-01T00:00:00Z' }, { Version: '2', LastModified: '2020-01-02T00:00:00Z' }],
          NextMarker: null
      });

      // Call the function
      await pruneVersionsByVersion('testFunction', 1, '2021-01-01');

      // Assertions
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Pruned older versions'));
    });

      it('executes without error', async () => {
          // Mock the functions within the module being tested, not on global
          jest.spyOn(moduleBeingTested, 'listFilteredLambdaFunctions').mockResolvedValue(['dev-function1', 'dev-function2']);
          jest.spyOn(moduleBeingTested, 'pruneVersionsByVersion').mockImplementation(() => Promise.resolve());

          // Call main or any other function that uses these mocks
          await main();  // Assuming main is an async function

          expect(listFilteredLambdaFunctions).toHaveBeenCalledWith('-dev');
          expect(pruneVersionsByVersion).toHaveBeenCalledTimes(2);
      });
  });
