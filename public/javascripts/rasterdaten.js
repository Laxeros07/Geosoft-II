var rasterdaten = null;
var bbox;

const rasterdatenForm = document.getElementById("rasterdatenForm");
const rasterdatenFiles = document.getElementById("rasterdatenFiles");
const rasterdatenHochladen = document.getElementById("rasterdatenHochladen");

rasterdatenForm.addEventListener("submit", submitFormR);

// Upload button is activated when a file has been choosen
// Skript Ausführen Button is activated when raster and trainingsdtat or model have been uploaded
rasterdatenFiles.addEventListener("change", () => {
  rasterdatenHochladen.disabled = false;
});
rasterdatenHochladen.disabled = true;
rasterdatenForm.reset();

function submitFormR(e) {
  skriptAusfuehren.disabled = false;

  e.preventDefault();
  let formData = new FormData();
  formData.append("daten", rasterdatenFiles.files[0]);
  for (var [key, value] of formData.entries()) {
    console.log(key, value);
  }

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      addGeotiffToMap("http://localhost:3000/rasterdaten.tif");
    })
    .catch((err) => ("Error occured", err));
}
