var express = require("express");
var router = express.Router();
var path = require("path");

router.get("/", function (req, res, next) {
  var options = {
    root: path.join(__dirname, "../public"),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  var fileName = "uploads/rasterdaten.tif";
  res.sendFile(fileName, options, function (err) {
    if (err) {
      next(err);
    } else {
      console.log("Sent:", fileName);
    }
  });
});
module.exports = router;
