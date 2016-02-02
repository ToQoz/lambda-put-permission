var assign = require('object-assign');

module.exports = function(stmt, params) {
  var params = assign({}, params);
  var stmt = assign({}, stmt);

  if (params.Qualifier) {
    params.FunctionName += ":" + params.Qualifier;
  }

  return !(
    stmt.Resource === params.FunctionName &&
    stmt.Effect === 'Allow' &&
    (stmt.Action === params.Action || (single(stmt.Action) && stmt.Action[0] === params.Action)) &&
    dig(stmt, 'Condition.ArnLike.AWS:SourceArn') === params.SourceArn &&
    dig(stmt, 'Principal.Service') === params.Principal &&
    dig(stmt, 'Condition.StringEquals.AWS:SourceAccount') === params.SourceAccount
  );
}

function dig(obj, key) {
  key.split(".").forEach(function(k) {
    if (!obj) {
      return obj;
    }
    obj = obj[k];
  });

  return obj;
}

function single(ary) {
  return Array.isArray(ary) && ary.length === 1;
}
