var express = require("express");
var router = express.Router();
var R = require("r-integration");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("Upload", { title: "Upload", p: R });
});

router.post("/", function (req, res, next) {
  let result = R.executeRCommand("max(1, 2, 3)");
  res.send("Result: " + result + "<br><a href='/upload'>Zurück</a>");
});

module.exports = router;
