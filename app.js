//===============================================
// modules
//===============================================
var express = require('express');
var path = require('path');
var app = express();
var GitHubApi = require("github");

//===============================================
// github
//===============================================
var github = new GitHubApi({
  version: "3.0.0",
  timeout: 5000
});

function getCommit(username, repo_name, sha){
  github.repos.getCommit({
    user: username,
    repo: repo_name,
    sha: sha
  }, function(err, res) {
    console.log(JSON.stringify(res));
  });
}

github.authenticate({
    type: "oauth",
    token: "2b77797588cbb746f28823065c0ec5576b326b6f"
});

//===============================================
// authentication
//===============================================
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// var callbackURL;
// if (process.env.NODE_ENV == 'production') {
//     console.log("Production environment found.");
//     callbackURL = "http://www.gitorial.com/auth/github/callback"
// } else {
//     console.log("Development environment found.");
//     callbackURL = "http://localhost:3000/auth/github/callback"
// }

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
      return done(null, profile);
  });
}));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// AWS
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});


//===============================================
// config
//===============================================

// all environments
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('meowsers'));
  app.use(express.session());
  //passport
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));


  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
    app.locals.pretty = true;
  }
});

//===============================================
// routes
//===============================================

// home
app.get('/', require('./routes/index')());
// edit
app.get('/edit/:repo', ensureAuthenticated, require('./routes/edit')());
// save
app.post('/save', require('./routes/save')());
// view
app.get('/view/:id/:curStep', require('./routes/view')());
// list github commits
app.get('/view/:id', require('./routes/view')());
/// load
app.get('/load/:id', require('./routes/load')());

app.get('/github/getList/:repo', ensureAuthenticated, require('./routes/github_list')());
app.get('/github/getStep/:repo/:step', ensureAuthenticated, require('./routes/github_step')());
app.get('/gitdatstuff/:repo', ensureAuthenticated, require('./routes/gitdatstuff')());
// delete
app.delete('/delete', require('./routes/delete')());

// authentication
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/');
    });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
