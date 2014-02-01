var objects = [];

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

function add_objects(object)
{
  objects.push(object);
}

function httpGet(theUrl)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function find_stuff(json)
{
  length = json.step_count;
  for (i = 0; i < length; i++)
  {
    response = httpGet(json["steps"][i]);
    console.log(response);
  }
}

function log_screen(json, username, repo_name)
{
  var GitHubApi = require('github');

  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });

  var final_object = {
    step_count: json.length,
    steps: []
  };

  list_sha = separate(json);

  for (i = 0; i < json.length; i++)
  {
    final_object.steps.push({url:""});
    final_object.steps[i].url = json[i].url;
  }
  
  return find_stuff(final_object);
}

function getCommitsList(username, repo_name){

  var GitHubApi = require('github');

  var github = new GitHubApi({
      version: "3.0.0",
      timeout: 5000
  });

  github.authenticate({
    type: "oauth",
    token: "2b77797588cbb746f28823065c0ec5576b326b6f"
  });

  var commitsList = [];

  github.repos.getCommits({
      user: username,
      repo: repo_name
  }, function(err, res) {
      commitsList = res;
      console.log(err);
      console.log(res);
      log_screen(commitsList, username, repo_name);
  });
}

module.exports = function(db) {
  return function (req, res) {
    var username_given = req.user.username;
    var name_given = req.user.displayName;
    getCommitsList(req.user.username, req.param('repo'));
  }
};