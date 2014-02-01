function getCommitsList(username, repo_name){

	var GitHubApi = require("github");

	var github = new GitHubApi({
	    version: "3.0.0",
	    timeout: 5000
	});
	github.repos.getCommits({
	    "user": username,
	    "repo": repo_name
	}, function(err, res) {
	    console.log(JSON.stringify(res));
	});
}

function getCommit(username, repo_name, sha){

	var GitHubApi = require("github");

	var github = new GitHubApi({
		version: "3.0.0",
		timeout: 5000
	});
	github.repos.getCommit({
		"user": username,
		"repo": repo_name,
		"sha": sha
	}, function(err, res) {
		console.log(JSON.stringify(res));
	});
}