function getCommitsList(username, repo_name){

  var GitHubApi = require('github');

  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });
  github.repos.getCommits({
      user: username,
      repo: repo_name
  }, function(err, res) {
      if (err != undefined)
      {
        var commitsList = res;
      }
      else
      {
        console.log(err);
      }
      
  });

  return function callback(){return commitsList;};
}

module.exports = function(db, repo_name) {
  return function (req, res) {
    var username_given = req.user.username
    getCommitsList(req.user.username, req.param('repo'));
    console.log(req.user);
    res.render('index', {user: {username: username_given}});
  }
};