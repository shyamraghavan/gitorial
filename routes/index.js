module.exports = function(db) {
  return function (req, res) {
    res.render('index', {user: JSON.stringify(req.user)});
  }
};
