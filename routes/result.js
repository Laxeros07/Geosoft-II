var express = require("express");
var router = express.Router();
var R = require("r-integration");
var request = require("request");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

const multer = require("multer");
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
  /*
  request(
    "http://host.docker.internal:7001/result",
    { json: true },
    (err, res2, body) => {
      if (err) {
        return console.log(err);
      }
      console.log(body);
      res.render("result", { title: "Result" });
    }
  );*/
});

/**
 * Aufrufen der Trainingsdatenseit (bearbeiten der seite)
 */
router.post("/trainingsdaten", function (req, res, next) {
  res.render("trainingsdaten", { title: "Demo Result" });
});

function uploadFiles(req, res) {
  console.log("lol");
  console.log("Hallo");
  console.log("Ciao");
  res.json({ message: "Successfully uploaded files" });
}

module.exports = router;
