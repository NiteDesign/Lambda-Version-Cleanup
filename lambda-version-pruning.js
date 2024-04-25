"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_lambda_1 = require("@aws-sdk/client-lambda");
var minimist = require("minimist");
var lambda = new client_lambda_1.LambdaClient({ region: 'us-east-1' });
function listFilteredLambdaFunctions(filterCriteria) {
    return __awaiter(this, void 0, void 0, function () {
        var nextMarker, filteredFunctions, command, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filteredFunctions = [];
                    _a.label = 1;
                case 1:
                    command = new client_lambda_1.ListFunctionsCommand({ Marker: nextMarker });
                    return [4 /*yield*/, lambda.send(command)];
                case 2:
                    response = _a.sent();
                    if (response.Functions) {
                        response.Functions.forEach(function (_a) {
                            var FunctionName = _a.FunctionName;
                            if (FunctionName && FunctionName.includes(filterCriteria)) {
                                filteredFunctions.push({ FunctionName: FunctionName });
                            }
                        });
                    }
                    //  filteredFunctions.push(...response.Functions.filter(func => func.FunctionName !== undefined && func.FunctionName.includes(filterCriteria)));
                    nextMarker = response.NextMarker;
                    _a.label = 3;
                case 3:
                    if (nextMarker) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4: return [2 /*return*/, filteredFunctions];
            }
        });
    });
}
function listAliases(functionName) {
    return __awaiter(this, void 0, void 0, function () {
        var command, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = new client_lambda_1.ListAliasesCommand({ FunctionName: functionName });
                    return [4 /*yield*/, lambda.send(command)];
                case 1:
                    response = _a.sent();
                    if (response.Aliases) {
                        return [2 /*return*/, response.Aliases ? response.Aliases.map(function (alias) { var _a; return (_a = alias.FunctionVersion) !== null && _a !== void 0 ? _a : ''; }) : []];
                    }
                    return [2 /*return*/, []];
            }
        });
    });
}
function listVersionsSorted(functionName) {
    return __awaiter(this, void 0, void 0, function () {
        var nextMarker, versions, command, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    versions = [];
                    _a.label = 1;
                case 1:
                    command = new client_lambda_1.ListVersionsByFunctionCommand({ FunctionName: functionName, Marker: nextMarker });
                    return [4 /*yield*/, lambda.send(command)];
                case 2:
                    response = _a.sent();
                    if (response.Versions) {
                        versions.push.apply(versions, response.Versions);
                    }
                    nextMarker = response.NextMarker;
                    _a.label = 3;
                case 3:
                    if (nextMarker) return [3 /*break*/, 1];
                    _a.label = 4;
                case 4: return [2 /*return*/, versions.sort(function (a, b) { var _a, _b; return new Date((_a = a.LastModified) !== null && _a !== void 0 ? _a : '').getTime() - new Date((_b = b.LastModified) !== null && _b !== void 0 ? _b : '').getTime(); })];
            }
        });
    });
}
function deleteVersion(functionName, version) {
    return __awaiter(this, void 0, void 0, function () {
        var command;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = new client_lambda_1.DeleteFunctionCommand({ FunctionName: functionName, Qualifier: version });
                    return [4 /*yield*/, lambda.send(command)];
                case 1:
                    _a.sent();
                    console.log("Deleted version ".concat(version, " of ").concat(functionName));
                    return [2 /*return*/];
            }
        });
    });
}
function pruneVersionsByVersion(functionName, keepLastN, latestDate) {
    return __awaiter(this, void 0, void 0, function () {
        var aliases, versions, cutoffDate, versionsToDelete, _i, versionsToDelete_1, version;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, listAliases(functionName)];
                case 1:
                    aliases = _b.sent();
                    return [4 /*yield*/, listVersionsSorted(functionName)];
                case 2:
                    versions = _b.sent();
                    cutoffDate = new Date(latestDate);
                    versionsToDelete = versions
                        .filter(function (version) {
                        var _a, _b;
                        return new Date((_a = version.LastModified) !== null && _a !== void 0 ? _a : '') < cutoffDate &&
                            version.Version !== "$LATEST" && !aliases.includes((_b = version.Version) !== null && _b !== void 0 ? _b : '');
                    })
                        .slice(0, -keepLastN);
                    _i = 0, versionsToDelete_1 = versionsToDelete;
                    _b.label = 3;
                case 3:
                    if (!(_i < versionsToDelete_1.length)) return [3 /*break*/, 6];
                    version = versionsToDelete_1[_i];
                    return [4 /*yield*/, deleteVersion(functionName, (_a = version.Version) !== null && _a !== void 0 ? _a : '')];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("Pruned older versions, kept the last ".concat(keepLastN, " versions for ").concat(functionName, "."));
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, filterCriteria, keepLastN, latestDate, functionNames, _i, functionNames_1, obj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = minimist(process.argv.slice(2));
                    filterCriteria = args.envStage || '-dev';
                    keepLastN = parseInt(args.keepLastN || 5);
                    latestDate = args.latestDate;
                    return [4 /*yield*/, listFilteredLambdaFunctions(filterCriteria)];
                case 1:
                    functionNames = _a.sent();
                    _i = 0, functionNames_1 = functionNames;
                    _a.label = 2;
                case 2:
                    if (!(_i < functionNames_1.length)) return [3 /*break*/, 5];
                    obj = functionNames_1[_i];
                    return [4 /*yield*/, pruneVersionsByVersion(obj.FunctionName, keepLastN, latestDate)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
