"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_lambda_1 = require("@aws-sdk/client-lambda");
const minimist_1 = __importDefault(require("minimist"));
const lambda = new client_lambda_1.LambdaClient({ region: 'us-east-1' });
async function listFilteredLambdaFunctions(filterCriteria) {
    let nextMarker;
    const filteredFunctions = [];
    do {
        const command = new client_lambda_1.ListFunctionsCommand({ Marker: nextMarker });
        const response = await lambda.send(command);
        filteredFunctions.push(...response.Functions.filter(func => func.FunctionName !== undefined && func.FunctionName.includes(filterCriteria)));
        nextMarker = response.NextMarker;
    } while (nextMarker);
    return filteredFunctions.map(func => func.FunctionName);
}
async function listAliases(functionName) {
    const command = new client_lambda_1.ListAliasesCommand({ FunctionName: functionName });
    const response = await lambda.send(command);
    return response.Aliases.map(alias => alias.FunctionVersion);
}
async function listVersionsSorted(functionName) {
    let nextMarker;
    const versions = [];
    do {
        const command = new client_lambda_1.ListVersionsByFunctionCommand({ FunctionName: functionName, Marker: nextMarker });
        const response = await lambda.send(command);
        versions.push(...response.Versions);
        nextMarker = response.NextMarker;
    } while (nextMarker);
    return versions.sort((a, b) => new Date(a.LastModified).getTime() - new Date(b.LastModified).getTime());
}
async function deleteVersion(functionName, version) {
    const command = new client_lambda_1.DeleteFunctionCommand({ FunctionName: functionName, Qualifier: version });
    await lambda.send(command);
    console.log(`Deleted version ${version} of ${functionName}`);
}
async function pruneVersionsByVersion(functionName, keepLastN, latestDate) {
    const aliases = await listAliases(functionName);
    const versions = await listVersionsSorted(functionName);
    const cutoffDate = new Date(latestDate);
    const versionsToDelete = versions
        .filter(version => new Date(version.LastModified) < cutoffDate &&
        version.Version !== "$LATEST" && !aliases.includes(version.Version))
        .slice(0, -keepLastN);
    for (const version of versionsToDelete) {
        await deleteVersion(functionName, version);
    }
    console.log(`Pruned older versions, kept the last ${keepLastN} versions for ${functionName}.`);
}
async function main() {
    const args = (0, minimist_1.default)(process.argv.slice(2));
    const filterCriteria = args.envStage || '-dev';
    const keepLastN = parseInt(args.keepLastN || 5);
    const latestDate = args.latestDate; // Expected format: YYYY-MM-DD
    const functionNames = await listFilteredLambdaFunctions(filterCriteria);
    for (const functionName of functionNames) {
        await pruneVersionsByVersion(functionName, keepLastN, latestDate);
    }
}
main();
//# sourceMappingURL=lambda-version-pruning.js.map