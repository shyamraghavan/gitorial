var objects = [];
var async = require('async');
var request = require('request');

var GitHubApi = require('github');

var github = new GitHubApi({
  version: "3.0.0",
  timeout: 5000
});

function separate(json)
{
  results = [];

  for (i = 0; i < json.length; i++)
  {
    results.push(json[i]["sha"]);
  }

  //console.log(results);
  return results;
}

function add_objects(object)
{
  objects.push(object);
}

function log_screen(json, username, repo_name, res2, req2)
{
  var final_object = {
    step_count: json.length,
    steps: []
  };

  list_sha = separate(json);
  function_list = [];

  for (var i = 0; i < list_sha.length; i++)
  {
    function_list.push(
      function() {
        var j = i;
        return function(callback){
          github.authenticate({
            type: "oauth",
            token: "2b77797588cbb746f28823065c0ec5576b326b6f"
          });

          list_this_sha = list_sha[j]

          github.repos.getCommit({
              user: username,
              repo: repo_name,
              sha: list_this_sha
          }, function(err, res) {
              url = res.files[0].raw_url;

              request(url, function(err, resp, body){
                callback(null, body);
              });
          });
        }
      }()
    );
  }

  async.series(function_list, 
    function(err, results)
    { 
      user_stuff = req2.user;
      results.reverse();
      res2.render("edit", {user: user_stuff, step_count: results.length, steps: results, repo: req2.params.repo});
    });
  
}

function getCommitsList(username, repo_name, res2, req2){

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
      log_screen(commitsList, username, repo_name, res2, req2);
  });
}

module.exports = function(db) {
  return function (req, res) {
    var username_given = req.user.username;
    var name_given = req.user.displayName;
    getCommitsList(req.user.username, req.param('repo'), res, req);
  }
};
