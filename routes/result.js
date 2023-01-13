var express = require("express");
var router = express.Router();
var R = require("r-integration");
var request = require("request");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

const multer = require("multer");
const { rawListeners } = require("../app");
const { urlencoded } = require("express");
const upload = multer({ dest: "uploads/" });

//router.post("/", upload.single("trainingsdaten"), uploadFiles);

router.post("/", function (req, res, next) {
  /*
  R.callMethod(
    "public/rScripts/classification2.r",
    "klassifizierung_ohne_Modell",
    {
      x: "x",
    }
  );
  */

  let url;
  switch (req.body.id) {
    case "trainingsdaten":
      url = "http://172.17.0.1:7001/result";
      break;
    case "modell":
      url = "http://172.17.0.1:7001/resultModell";
      break;
  }

  request(url, { json: true }, (err, res2, body) => {
    if (err) {
      return console.log(err);
    }
    res.render("result", { title: "Result" });
  });
});

/**
 * Aufrufen der Trainingsdatenseit (bearbeiten der seite)
 */
/*
router.post("/trainingsdaten", function (req, res, next) {
  res.render("trainingsdaten", { title: "Demo Result" });
});
*/
function uploadFiles(req, res) {
  res.json({ message: "Successfully uploaded files" });
}

module.exports = router;
