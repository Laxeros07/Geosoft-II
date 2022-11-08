var express = require("express");
var router = express.Router();
var R = require("r-integration");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("Upload", { title: "Upload", data: "" });
});

router.post("/", function (req, res, next) {
  let result = R.executeRScript("public/rScripts/test.r");
  res.render("Upload", { title: "Upload", data: result });
});

module.exports = router;
