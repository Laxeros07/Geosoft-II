var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("trainingsdaten", { title: "Trainingsdaten bearbeiten" });
});

module.exports = router;
