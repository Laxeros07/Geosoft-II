var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("handbuch", { title: "Handbuch" });
});

router.post("/handbuch", function (req, res, next) {
  res.render("handbuch", { title: "Handbuch" });
});

module.exports = router;
