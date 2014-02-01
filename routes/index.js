module.exports = function(db) {
  return function (req, res) {
    var AWS = require("aws-sdk");
    var s3 = new AWS.S3();

    if (req.user) {
      var params = {Bucket: "gitorial", Key: req.user.username};
      try {
        s3.getObject(params, function(error, data) {
          if (data == null) 
            res.render('index', {user: req.user});
          else {
            console.log(data.Body.toString());
            res.render('index', {user: req.user, tutorials: JSON.parse(data.Body.toString())});
          }
        });
      } catch (err) {
        res.render('index', {user: req.user});
      }
    } else {
      res.render('index');
    }
  }
};
