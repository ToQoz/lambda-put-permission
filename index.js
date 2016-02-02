var assign = require('object-assign');
var hasDiff = require('./lib/has_diff');

module.exports = function(lambda, params, cb) {
  var cb = cb || function() {};
  var params = assign({}, params);

  arn(lambda, params.FunctionName, function(err, arn) {
    params.FunctionName = arn;
    find(lambda, params, function(err, stmt) {
      if (err) {
        cb(err, null);
      } else {
        if (stmt) {
          if (hasDiff(stmt, params)) {
            update(lambda, stmt, params, cb);
          } else {
            noop(stmt, cb);
          }
        } else {
          add(lambda, params, cb);
        }
      }
    });
  });
};

function update(lambda, stmt, params, cb) {
  remove(lambda, stmt, params, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      add(lambda, params, cb);
    }
  });
}

function noop(stmt, cb) {
  cb(null, {
    Changed: false,
    Statement: JSON.stringify(stmt)
  });
}

function add(lambda, params, cb) {
  lambda.addPermission(params, function(err, data) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, {
        Changed: true,
        Statement: data.Statement
      });
    }
  });
}

function remove(lambda, stmt, params, cb) {
  var params = {
    FunctionName: params.FunctionName,
    StatementId: stmt.Sid,
    Qualifier: params.Qualifier
  };
  lambda.removePermission(params, cb);
}

function find(lambda, params, cb) {
  list(lambda, params, function(err, stmts) {
    if (err) {
      cb(err, null);
    } else {
      var stmt = stmts.find(function(stmt) {
        return stmt.Sid && stmt.Sid === params.StatementId;
      });
      cb(null, stmt);
    }
  });
}

function list(lambda, params, cb) {
  // I supporse Lambda#getPolicy is broken.
  // It with Qualifier param fails.
  //   lambda.getPolicy({
  //     FunctionName: params.FunctionName,
  //     Qualifier: params.Qualifier
  //   }
  // That's why I add :qualifier to the end of function arn.
  var functionName = params.FunctionName;
  if (params.Qualifier) {
    functionName += ":" + params.Qualifier;
  }

  lambda.getPolicy(
    {
      FunctionName: functionName,
    },
    function(err, data) {
      if (err) {
        if (err.statusCode === 404) {
          cb(null, []);
        } else {
          cb(err, null);
        }
      } else {
        cb(null, JSON.parse(data.Policy).Statement);
      }
    });
}

function arn(lambda, functionName, cb) {
  lambda.getFunction(
    {
    FunctionName: functionName
    },
    function(err, data) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, data.Configuration.FunctionArn);
      }
    }
  );
}
