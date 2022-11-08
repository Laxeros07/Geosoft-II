var express = require("express");
var router = express.Router();
var R = require("r-integration");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("Upload", { title: "Upload", data: "", radius: "", selected: "" });
});

router.post("/", function (req, res, next) {
  let result;
  switch (req.body.select) {
    case "flaeche":
      result = R.callMethod("public/rScripts/flaeche.r", "x", {
        radius: parseInt(req.body.radius),
      });
      break;
    case "max":
      result = R.executeRScript("public/rScripts/test.r");
      break;
  }

  res.render("Upload", {
    title: "Upload",
    data: result,
    radius: req.body.radius,
    selected: req.body.select,
  });
});

module.exports = router;
