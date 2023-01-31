// Bounding Box Layer
var boundingBox = null;

// Trainingsdaten:
const trainingsdatenKnopf = document.getElementById("trainingsdaten");
// Modell:
const modellKnopf = document.getElementById("modell");
// Trainingsdaten:
const trainingsdatenForm = document.getElementById("trainingsdatenForm");
const trainingsdatenFiles = document.getElementById("trainingsdatenFiles");
const trainingsdatenHochladen = document.getElementById(
  "trainingsdatenHochladen"
);
// Modell:
const modellForm = document.getElementById("modellForm");
const modelFiles = document.getElementById("modelFiles");
const modellHochladen = document.getElementById("modellHochladen");

// Trainingsdaten:
function hideTrainingsdatenForm() {
  trainingsdatenForm.style.display = "block"; // <-- Set it to block
  modellKnopf.style.display = "block"; // <-- Set it to block
  modellForm.style.display = "none";
  trainingsdatenKnopf.style.display = "none";
  document.getElementById("idInput").value = "trainingsdaten";
  document.getElementById("algorithmusDiv").style.display = "block";
}
// Modell:
function hideModellForm() {
  modellForm.style.display = "block"; // <-- Set it to block
  trainingsdatenKnopf.style.display = "block"; // <-- Set it to block
  trainingsdatenForm.style.display = "none";
  modellKnopf.style.display = "none";
  document.getElementById("idInput").value = "modell";
  document.getElementById("algorithmusDiv").style.display = "none";
}
// Trainingsdaten:
trainingsdatenForm.addEventListener("submit", submitFormT);
// Modell:
modellForm.addEventListener("submit", submitFormM);

// Trainingsdaten:
// Hochladen Button wird aktiviert, wenn etwas hochgeladen wurde
// Skript Ausführen Button wird aktiviert, wenn Raster- und Trainingsdaten vorliegen
trainingsdatenFiles.addEventListener("change", (event) => {
  trainingsdatenHochladen.disabled = false;
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = (event) => {
    const content = event.target.result;
    const json = JSON.parse(content);
    console.log(json);
  };
});
trainingsdatenHochladen.disabled = true;
trainingsdatenForm.reset();

// Modell:
// Hochladen Button wird aktiviert, wenn etwas hochgeladen wurde
// Skript Ausführen Button wird aktiviert, wenn Raster- und Modell vorliegen
modelFiles.addEventListener("change", () => {
  modellHochladen.disabled = false;
});
modellHochladen.disabled = true;
modellForm.reset();

// Wenn Trainingsdaten hochgeladen wurden
function submitFormT(e) {
  if (document.getElementById("rasterdatenFiles").value != "") {
    skriptAusfuehren.disabled = false;
    smallText.style.display = "none";
  }
  e.preventDefault();
  let formData = new FormData();

  formData.append("daten", trainingsdatenFiles.files[0]);
  var dateiname = trainingsdatenFiles.files[0].name;

  // Dateityp wird abgefragt und dann gesetzt
  if (getDateityp(dateiname) == "geojson") {
    trainingsdatenFiles.files[0].type = "application/geo+json";
  } else if (getDateityp(dateiname) == "json") {
    trainingsdatenFiles.files[0].type = "application/json";
  } else {
    trainingsdatenFiles.files[0].type = "application/octet-stream";
  }

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
    headers: {},
  })
    .then(function (response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      return response.json();
    })
    .then(function (data) {
      // `data` is the parsed version of the JSON returned from the above endpoint.
      console.log(data); // { "userId": 1, "id": 1, "title": "...", "body": "..." }
      console.log(dateiname);

      // Die verschiedenen Labels werden in einem Set gespeichert
      let labels = new Set();
      data.json.features.forEach((element) => {
        labels.add(element.properties.Label);
      });
      // Das Set mit den Labels wird in einen Array umgewandelt
      const labelsArray = Array.from(labels);
      let layerArray = [];
      // Für jedes Array wird eine zufällige Frabe erstellt und in der Variabel color gespeichert
      for (let index = 0; index < labelsArray.length; index++) {
        let label = labelsArray[index];
        color = getRandomColor();
        // Für jedes Label werden alle features mit dem selben Label herausgefiltert und bekommen die
        // Farbe zuvor gespeicherte Farbe zugeordnet
        data.json.features.forEach((element) => {
          if (element.properties.Label == label) {
            layerArray.push(
              L.geoJSON(element, {
                style: {
                  color: color,
                  fillColor: color,
                  weight: 3,
                  opacity: 0.65,
                  fillOpacity: 0.65,
                },
              }).bindPopup(function (layer) {
                let text =
                  "<b>ClassID:</b> " +
                  layer.feature.properties.ClassID +
                  "<br>";
                text += "<b>Label:</b> " + layer.feature.properties.Label;
                return text;
              })
            );
          }
        });
      }
      let group = L.layerGroup(layerArray).addTo(map);
      layerControl.addOverlay(group, "Trainingspolygone");
    })
    .catch((err) => ("Error occured", err));
}

// Wenn ein Modell hochgeladen wurde
function submitFormM(e) {
  if (document.getElementById("rasterdatenFiles").value != "") {
    skriptAusfuehren.disabled = false;
    smallText.style.display = "none";
  }
  e.preventDefault();
  let formData = new FormData();

  formData.append("daten", modelFiles.files[0]);

  for (var [key, value] of formData.entries()) {
    console.log(key, value);
  }

  var dateiname = modelFiles.files[0].name;

  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: formData,
    headers: {},
  });
}
