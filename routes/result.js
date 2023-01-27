var express = require("express");
var router = express.Router();
var R = require("r-integration");
var request = require("request");
var JSZip = require("jszip");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

const multer = require("multer");
const { rawListeners } = require("../app");
const { urlencoded } = require("express");
const upload = multer({ dest: "uploads/" });

//router.post("/", upload.single("trainingsdaten"), uploadFiles);
/*
router.post("/bearbeiten", function (req, res, next) {
  res.render("trainingsdaten", { title: "Trainingsdaten bearbeiten" });
});
*/
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
  let bbSplit = "";
  console.log("bb: " + req.body.bb);
  if (req.body.bb != "") {
    //Es wurde eine Boundingbox angegeben
    url = "http://172.17.0.1:7001/";
    bbSplit = req.body.bb.split(",");
  } else {
    //Es wurde keine Boundingbox angegeben
    url = "http://172.17.0.1:7001/result?";
  }

  //Zusammenbauen der Url mit den Parametern
  switch (req.body.id) {
    case "trainingsdaten":
      url += "result?";
      if (bbSplit != "") {
        //Boundingbox
        url +=
          "ymin=" +
          bbSplit[2] +
          "&ymax=" +
          bbSplit[3] +
          "&xmin=" +
          bbSplit[0] +
          "&xmax=" +
          bbSplit[1] +
          "&";
      }
      break;
    case "modell":
      url += "resultModell?";
      if (bbSplit != "") {
        //Boundingbox
        url +=
          "ymin=" +
          bbSplit[2] +
          "ymax=" +
          bbSplit[3] +
          "xmin=" +
          bbSplit[0] +
          "xmax=" +
          bbSplit[1] +
          "&";
      }
      break;
  }
  if (req.body.anzahl != "" && req.body.id == "trainingsdaten") {
    url += "baumAnzahl=" + req.body.anzahl + "&";
  }
  if (req.body.tiefe != "" && req.body.id == "trainingsdaten") {
    url += "baumTiefe=" + req.body.tiefe;
  }

  console.log("URL:");
  console.log(url);

  request(url, { json: true }, (err, res2, body) => {
    console.log(res2.body);
    console.log(body);
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
