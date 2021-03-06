var async = require('async');

module.exports = function(db) {
  return function (req, res) {
    var AWS = require("aws-sdk");
    var s3 = new AWS.S3();

    var params = {Bucket: 'gitorial', Key: (req.param("id")+".json")};
    try {
      s3.getObject(params, function(error, data) {
        console.log("makeView");
        makeView(req, res, JSON.parse(data.Body.toString()), s3);
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }
};

function makeView(req, res, meta, s3) {
    var out = new Object();
    out.title = meta.title;
    out.steps = meta.steps;
    out.steptitle = meta.steptitle;

    out.html = [];
    function_list = [];
    for(var i=1; i<=Number(meta.steps); i++) {
      function_list.push(
          function() {
            var j = i;
            return function(callback) {
              var params = {Bucket: 'gitorial', Key: (req.param("id")+"-"+j)};
              s3.getObject(params, function(error, data) {
                callback(null, data.Body.toString());
              });
            }
          }()
        );
    }

    async.series(function_list,
        function(err, data) {
          out.html = data;
          res.end(JSON.stringify(out));
      });
}
/*
    for(var i=1; i<meta.steps; i++) {
      var params = {Bucket: 'gitorial', Key: (req.param("id")+"-"+ i)};
      try {
       s3.getObject(params, function(error, data, out) {
         out.html[i] = data.Body.toString();
       });
      } catch (err) {
        console.log(err);
       return;
     }
    }

    res.send(out);
}*/
