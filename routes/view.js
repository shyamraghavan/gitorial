module.exports = function(db) {
  return function (req, res) {
    res.render("view", {curStep: req.param("curStep")});
  }
};
