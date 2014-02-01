function separate(json)
{
  results = [];

  for (i = 0; i < json.length; i++)
  {
    results.push(json[i]["sha"]);
  }

  console.log(results);
  return results;
}

function log_screen(json, username, repo_name, step)
{
  var GitHubApi = require('github');

  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });

  list_sha = separate(json);

  console.log(github.repos.getCommit({
    user: username,
    repo: repo_name,
    sha: list_sha[step - 1]
  }, function(err, res) {
    console.log(res["files"][0]["raw_url"]);
    console.log(res["files"][0]["patch"]);
  }));
}

function getCommitsList(username, repo_name, step){

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
      commitsList = res;
      log_screen(commitsList, username, repo_name, step);
  });
}

module.exports = function(db) {
  return function (req, res) {
    var username_given = req.user.username;
    var name_given = req.user.displayName;
    getCommitsList(req.user.username, req.param('repo'), Number(req.param('step')));
    res.render('index', {user: {username: username_given, displayName: name_given}});
  }
};