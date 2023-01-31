var rasterdaten = null;
var bbox;

const rasterdatenForm = document.getElementById("rasterdatenForm");
const rasterdatenFiles = document.getElementById("rasterdatenFiles");
const rasterdatenHochladen = document.getElementById("rasterdatenHochladen");

rasterdatenForm.addEventListener("submit", submitFormR);

// Hochladen Button wird aktiviert, wenn etwas hochgeladen wurde
// Skript Ausführen Button wird aktiviert, wenn Raster- und Trainingsdaten vorliegen
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
