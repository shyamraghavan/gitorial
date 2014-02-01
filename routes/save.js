module.exports = function(db) {
  return function (req, res) {
    var AWS = require("aws-sdk");
    var s3 = new AWS.S3();

    var meta = new Object();
    meta.title = req.body.title;
    meta.steps = req.body.steps;
    meta.steptitle = new Object();
    for(var i = 1; i <= Number(meta.steps); i++) {
      console.log(i);
      meta.steptitle[i] = req.body.steptitle[i];
    }
    var params = {Bucket: 'gitorial', Key: (req.body.repo+'.json'), Body: JSON.stringify(meta)}

    s3.putObject(params, function(err, data) {
      if (err)
        console.log(err);
    });

    for(var i = 1; i <= Number(meta.steps); i++) {
      s3.putObject({Bucket: 'gitorial', Key: (req.body.repo+'-'+i), Body: req.body.html[i]}, function(err, data) {
        if (err)
          console.log(err);
      });
    }

    try {
      s3.getObject({Bucket: 'gitorial', Key: req.user.username}, function(error, data) {
        if (data == null) {
          values = new Object();
        } else {
          values = JSON.parse(data.Body.toString());
        }
        var state = new Object();
        state.title = req.body.title;
        state.url = "view/"+req.body.repo;


        var repo = req.body.repo;
        values.repo = JSON.stringify(state);

        s3.putObject({Bucket: 'gitorial', Key: req.user.username, Body: JSON.stringify(values)}, function(err, d) {
          if (err)
            console.log(err);
        });
      });
    } catch (err) {
      console.log(err);
    }
    res.redirect('/');
  }
};
