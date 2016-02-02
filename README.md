# lambda-put-permission

## Usage

adds or updates(= deletes & adds) permission of AWS Lambda's function

```javascript
var AWS = require('aws-sdk');
AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: 'org-stuff'
});

// AWS
var awsAccountId = '000000000000';
// API Gateway
var apiRestApiId = 'restapiid';
var apiMethod = 'GET'
var apiPath = 'hi/hi/hi'
// Lambda
var functionName = 'foo'
var qualifier = 'prod'

var putPermission = require('.');

putPermission(
  new AWS.Lambda({
    region: 'ap-northeast-1'
  }),
  {
    StatementId: [apiMethod, apiPath.replace(/\//g, '_'), 'invoke', functionName, qualifier].join('-'),
    Action: 'lambda:InvokeFunction',
    FunctionName: functionName,
    Principal: 'apigateway.amazonaws.com',
    SourceArn: 'arn:aws:execute-api:ap-northeast-1:' + awsAccountId + ':' + apiRestApiId + '/*/' + apiMethod + '/' + apiPath, // OPTIONAL
    SourceAccount: awsAccountId, // OPTIONAL
    Qualifier: qualifier // OPTIONAL
  },
  function(err, data) {
    if (err) console.dir(err);
    else console.dir(data);
  }
)
```

## API

```javascript
var putPermission = require('lambda-put-permission')
```

### putPermission(lambda, params, cb)

This function adds or updates(= deletes & adds) permission of AWS Lambda's function

- Arguments
  - lambda - **required** - `instance of AWS.Lambda`
  - params - **required** - `map`
    - Action - **required** - `String`
    - FunctionName - **required** - `String`
    - Principal - **required** - `String`
    - StatementId - **required** - `String`
    - Qualifier - `String`
    - SourceAccount - `String`
    - SourceArn - `String`
  - cb - `Function(err, data) {}` - called with following arguments on the end of operation
    - Arguments
      - err - `Error` - the error object from aws-sdk. Set to `null` if the operation is successful.
      - data - `map` - the data from aws-sdk. Set to `null` if the operation error occur.
        - Changed - `boolean` - Set to `false` if the statement does't have any changes and nothing to do.
        - Statement - `String` - policy JSON
