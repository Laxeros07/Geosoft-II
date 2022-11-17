//var trainingsdaten = null;
var trainingsdatenInput = document.getElementById("trainingsdatenInput");
var trainingsdatenHochladen = document.getElementById(
  "trainingsdatenHochladen"
);

trainingsdatenInput.addEventListener("change", fileChange);
trainingsdatenHochladen.addEventListener("click", uploadTrainingsdaten);

// Karte mit Zentrum definieren
var map = L.map("map").setView([52, 7.6], 10);

// OSM Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

if (trainingsdaten != null) {
  console.log(trainingsdaten);
}

/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
 * @param {*} event
 */
function fileChange(event) {
  var reader = new FileReader();
  reader.onload = (event) => {
    trainingsdaten = event.target.result;
    console.log(trainingsdaten);
    //console.log(trainingsdatenInput);

    //uploadTrainingsdaten();
  };
  reader.readAsText(event.target.files[0]);
  /*
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(event.target.files[0]); //your file(s) reference(s)
  trainingsdatenInput.files = dataTransfer.files;
  */
}

function uploadTrainingsdaten() {
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: trainingsdaten,
  });
}
