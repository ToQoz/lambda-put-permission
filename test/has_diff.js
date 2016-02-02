var hasDiff = require("../lib/has_diff");
var test = require("tape");

test("hassDiff", function(t) {
  t.plan(2);

  var statement = {
    Condition: {
      StringEquals: {
        "AWS:SourceAccount": "000000000000"
      },
      ArnLike: {
        "AWS:SourceArn": "arn:aws:execute-api:ap-northeast-1:000000000000:xxxrest/*/GET/hi/hi/hi"
      }
    },
    Action: "lambda:InvokeFunction",
    Resource: "arn:aws:lambda:ap-northeast-1:000000000000:function:foo:prod",
    Effect: "Allow",
    Principal: {
      Service: "apigateway.amazonaws.com"
    },
    Sid: "GET-hi_hi_hi-invoke-foo-prod"
  };
  var params = {
    StatementId: 'GET-hi_hi_hi-invoke-foo-prod',
    Action: 'lambda:InvokeFunction',
    FunctionName: 'arn:aws:lambda:ap-northeast-1:000000000000:function:foo',
    Principal: 'apigateway.amazonaws.com',
    SourceArn: 'arn:aws:execute-api:ap-northeast-1:000000000000:xxxrest/*/GET/hi/hi/hi',
    SourceAccount: '000000000000',
    Qualifier: 'prod'
  }
  
  t.ok(!hasDiff(statement, params), "should not have diff")

  params.Action = 'lambda:getFunction'
  t.ok(hasDiff(statement, params), "should have diff")
});
