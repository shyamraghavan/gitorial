module.exports = function(db) {
  return function (req, res) {
    res.render('index', {user: req.user});
  }
};
