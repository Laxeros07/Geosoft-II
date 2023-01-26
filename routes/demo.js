var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("demo", { title: "Demo" });
});

router.post("/result", function (req, res, next) {
  res.send(test);
  res.render("demo_result", { title: "Demo Result" });
});

module.exports = router;
