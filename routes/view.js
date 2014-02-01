module.exports = function(db) {
  return function (req, res) {
    var AWS = require("aws-sdk");
    var s3 = new AWS.S3();

    var params = {Bucket: 'gitorial', Key: (req.param("id")+".json")};
    try {
      s3.getObject(params, function(error, data) {
        makeView(req, res, JSON.parse(data.Body.toString()), s3);
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }
};

function makeView(req, res, meta, s3) {
    if (req.param("curStep"))
      stp = req.param("curStep");
    else {
      res.redirect('view/'+req.param("id")+"/1");
      return;
    }
    var params = {Bucket: 'gitorial', Key: (req.param("id")+"-"+ stp)};
    try {
      s3.getObject(params, function(error, data) {
        res.render("view", {curStep: stp, data: eval(data.Body.toString()), meta: meta, id: req.param("id")});
      });
    } catch (err) {
      console.log(err);
      return;
    }
}
