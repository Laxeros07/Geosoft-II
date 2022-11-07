var express = require("express");
var router = express.Router();
var R = require("r-integration");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("Upload", { title: "Upload", p: R });
});

router.post("/", function (req, res, next) {
  let result = R.executeRCommand("max(1, 2, 3)");
  console.log(result);
  res.send("Result: " + result)
});

module.exports = router;
