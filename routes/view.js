module.exports = function(db) {
  return function (req, res) {
    var AWS = require("aws-sdk");
    var s3 = new AWS.S3();
    var fs = require('fs');
    console.log(req.param("id")+"-"+ req.param("curStep"));
    var params = {Bucket: 'gitorial', Key: (req.param("id")+"-"+ req.param("curStep"))};
    var file= fs.createWriteStream('./temp.tmp');
    try {
      s3.getObject(params, function(error, data) {
        res.render("view", {curStep: req.param("curStep"), data: data.Body.toString()});
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }
};
