import { LambdaClient, ListFunctionsCommand, ListVersionsByFunctionCommand, DeleteFunctionCommand, ListAliasesCommand } from '@aws-sdk/client-lambda';
import minimist = require('minimist')

const lambda = new LambdaClient({ region: 'us-east-1' });

async function listFilteredLambdaFunctions(filterCriteria: string): Promise<{ FunctionName: string }[]> {
    let nextMarker: string | undefined;
    const filteredFunctions: { FunctionName: string }[] = [];
    do {
        const command = new ListFunctionsCommand({ Marker: nextMarker });
        const response = await lambda.send(command);

        if (response.Functions) {
            response.Functions.forEach(({FunctionName}) => {
                if (FunctionName && FunctionName.includes(filterCriteria)) {
                    filteredFunctions.push({ FunctionName })
                }
            })
        }

       //  filteredFunctions.push(...response.Functions.filter(func => func.FunctionName !== undefined && func.FunctionName.includes(filterCriteria)));
        nextMarker = response.NextMarker;
    } while (nextMarker);
    return filteredFunctions
}

async function listAliases(functionName: string): Promise<string[]> {
    const command = new ListAliasesCommand({ FunctionName: functionName });
    const response = await lambda.send(command);
    if (response.Aliases) {
         return response.Aliases ? response.Aliases.map(alias => alias.FunctionVersion ?? '') : [];
    }
    return [];
}

async function listVersionsSorted(functionName: string) {
    let nextMarker: string | undefined;
    const versions = [];
    do {
        const command = new ListVersionsByFunctionCommand({ FunctionName: functionName, Marker: nextMarker });
        const response = await lambda.send(command);
        if (response.Versions) {
            versions.push(...response.Versions);
        }

        nextMarker = response.NextMarker;
    } while (nextMarker);
    return versions.sort(
        (a, b) =>
            new Date(a.LastModified ?? '').getTime() - new Date(b.LastModified ?? '').getTime()
    );
}

async function deleteVersion(functionName: string, version: string) {
    const command = new DeleteFunctionCommand({ FunctionName: functionName, Qualifier: version });
    await lambda.send(command);
    console.log(`Deleted version ${version} of ${functionName}`);
}

async function pruneVersionsByVersion(functionName: string, keepLastN: number, latestDate: string) {
    const aliases = await listAliases(functionName);
    const versions = await listVersionsSorted(functionName);
    const cutoffDate = new Date(latestDate);
    const versionsToDelete = versions
        .filter(version =>
            new Date(version.LastModified ?? '') < cutoffDate &&
            version.Version !== "$LATEST" && !aliases.includes(version.Version ?? '')
        )
        .slice(0, -keepLastN);

    for (const version of versionsToDelete) {
        await deleteVersion(functionName, version.Version ?? '');
    }
    console.log(`Pruned older versions, kept the last ${keepLastN} versions for ${functionName}.`);
}

async function main() {
    const args = minimist(process.argv.slice(2));
    const filterCriteria = args.envStage || '-dev';
    const keepLastN = parseInt(args.keepLastN || 5);
    const latestDate = args.latestDate; // Expected format: YYYY-MM-DD

    const functionNames = await listFilteredLambdaFunctions(filterCriteria);
    for (const obj of functionNames) {
        await pruneVersionsByVersion(obj.FunctionName, keepLastN, latestDate);
    }
}

main();
