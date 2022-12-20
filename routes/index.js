var express = require("express");
var router = express.Router();

const fs = require("fs");
const path = require("path");
/*
const directory = path.join(__dirname, "../public/uploads");
fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(directory, file), (err) => {
      if (err) throw err;
    });
  }
});
*/
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Home" });
});

module.exports = router;
