// Hab den code von der seite https://stuk.github.io/jszip/documentation/examples/downloader.html
// geklaut falls jmd weiter dran bastel will

import JSZip from "jszip";

const downloadKnopf = document.getElementById("download");
const downloadForm = document.getElementById("download_form");

function urlToPromise(url) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

$("#download_form").on("submit", function () {
  var zip = new JSZip();

  // find every checked item
  $(this)
    .find(":checked")
    .each(function () {
      var $this = $(this);
      var url = $this.data("url");
      var filename = url.replace(/.*\//g, "");
      zip.file(filename, urlToPromise(url), { binary: true });
    });

  // when everything has been downloaded, we can trigger the dl
  zip
    .generateAsync({ type: "blob" }, function updateCallback(metadata) {
      var msg = "progression : " + metadata.percent.toFixed(2) + " %";
      if (metadata.currentFile) {
        msg += ", current file = " + metadata.currentFile;
      }
    })
    .then(function callback(blob) {
      // see FileSaver.js
      saveAs(blob, "example.zip");
    });

  return false;
});
