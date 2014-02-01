function separate(json)
{
  console.log(json[1]);
}

function log_screen(json)
{
  list_sha = separate(json);
}

function getCommitsList(username, repo_name){

  var GitHubApi = require('github');

  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });

  var commitsList = [];

  github.repos.getCommits({
      user: username,
      repo: repo_name
  }, function(err, res) {
        commitsList = JSON.stringify(res);
        log_screen(commitsList);
  });
}

module.exports = function(db) {
  return function (req, res) {
    var username_given = req.user.username;
    var name_given = req.user.displayName;
    getCommitsList(req.user.username, req.param('repo'));
    res.render('index', {user: {username: username_given, displayName: name_given}});
  }
};