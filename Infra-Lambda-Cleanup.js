const AWS = require('aws-sdk');

var lambda = new AWS.Lambda({region: 'us-east-1'});

//Retrieve a list of all the Lambdas
function listLambdas(nextMarker){
  var params = {
    Marker: nextMarker
  };
  lambda.listFunctions(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      for(var x = 0; x < data.Functions.length; x++){
        //To reduce the API rate limits, a timeout is set to run at intervals
        //retrieving the Aliases for each Lambda
        setTimeout(listLambdaAliases, 500 * x, data.Functions[x].FunctionName);
      };
      //data.NextMarker used to retrieve the next group of Lambdas
      if (data.NextMarker !== null) {
        //Timeout to limit the API rate
        setTimeout(listLambdas, 1000, data.NextMarker);
      };
    }
  });
}

//Get Lambda Aliases
function listLambdaAliases(functionName){
  var params = {
   FunctionName: functionName
  };
  lambda.listAliases(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
      var aliases = [];
      for(var x = 0; x < data.Aliases.length; x++){
        aliases.push(data.Aliases[x].FunctionVersion);
      }
      listLambdaVersion(functionName, aliases)
    }
  });
}

//List the Lambda versions for each Lambda
function listLambdaVersion(functionName, functionAliases, nextMarker){

  var params = {
    Marker: nextMarker,
   FunctionName: functionName
  };

  lambda.listVersionsByFunction(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else {
       //Compare each version with Alias version, if not in use, then Delete
       for(var x = 0; x < data.Versions.length; x++){

        if(data.Versions[x].Version != "$LATEST" && functionAliases.indexOf(data.Versions[x].Version) < 0){
          //To reduce the API rate limits, a timeout is set to run at intervals
          setTimeout(deleteLambdaVersion, 500 * x, data.Versions[x].FunctionName, data.Versions[x].Version)
        } else {
          console.log("RETAIN version " + data.Versions[x].Version + " from " + data.Versions[x].FunctionName);
        }
       }

       if (data.NextMarker !== null) {
         setTimeout(listLambdaVersion, 1000, functionName, functionAliases, data.NextMarker);
       };
    }

   });
}

//Delete the Lambda versions not in use
function deleteLambdaVersion(functionName, functionVersion){
  console.log("DELETE version " + functionVersion + " from " + functionName)
  var params = {
    FunctionName: functionName,
    Qualifier: functionVersion
  };
  lambda.deleteFunction(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 })
}

exports.handler = (event, context, callback) => {
    listLambdas();
};
