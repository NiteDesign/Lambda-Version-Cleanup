# Lambda-Version-Cleanup
Lambda function to remove unused Lambda versions

**!!Use at your own RISK!!**

This will loop through all Lambda functions and delete any Lambda versions that are not assigned to a Lambda Alias.

This includes some timeouts to help reduce the possibility of receiving API rate limits when retrieving and deleting the Lambda versions. It may be required to increase the Lambda's **Maximum execution time (timeout)** depending on the number of Lambdas and versions for each.

**!!Use at your own RISK!!**

**Disclaimer** All data and information provided on this site is for informational purposes only. I make no representations as to accuracy, completeness, currentness, suitability, or validity of any information on this site and will not be liable for any errors, omissions, or delays in this information or any losses, injuries, or damages arising from its display or use. All information is provided on an as-is basis.
