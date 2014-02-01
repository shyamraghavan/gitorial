module.exports = function() {
  return function (req, res) {
    res.render('edit', {user: req.user});
  }
};
