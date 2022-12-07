var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("result", { title: "Result" });
});

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("trainingsdaten"), uploadFiles);

function uploadFiles(req, res) {
  console.log("lol");
  console.log("Hallo");
  console.log("Ciao");
  res.json({ message: "Successfully uploaded files" });
}

module.exports = router;
