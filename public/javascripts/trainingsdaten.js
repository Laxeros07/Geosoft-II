// Bounding Box Layer
var boundingBox = null;

// TRainingsdata::
const trainingsdatenKnopf = document.getElementById("trainingsdaten");
// Model:
const modellKnopf = document.getElementById("modell");
// Trainingsdata:
const trainingsdatenForm = document.getElementById("trainingsdatenForm");
const trainingsdatenFiles = document.getElementById("trainingsdatenFiles");
const trainingsdatenHochladen = document.getElementById(
  "trainingsdatenHochladen"
);
// Model:
const modellForm = document.getElementById("modellForm");
const modelFiles = document.getElementById("modelFiles");
const modellHochladen = document.getElementById("modellHochladen");

// hide Trainingsdata:
function hideTrainingsdatenForm() {
  trainingsdatenForm.style.display = "block"; // <-- Set it to block
  modellKnopf.style.display = "block"; // <-- Set it to block
  modellForm.style.display = "none";
  trainingsdatenKnopf.style.display = "none";
  document.getElementById("idInput").value = "trainingsdaten";
  document.getElementById("algorithmusDiv").style.display = "block";
  document.getElementById("reduzierenDiv").style.display = "block";
}
// hide Model:
function hideModellForm() {
  modellForm.style.display = "block"; // <-- Set it to block
  trainingsdatenKnopf.style.display = "block"; // <-- Set it to block
  trainingsdatenForm.style.display = "none";
  modellKnopf.style.display = "none";
  document.getElementById("idInput").value = "modell";
  document.getElementById("algorithmusDiv").style.display = "none";
  document.getElementById("reduzierenDiv").style.display = "none";
}
// Event listener Trainingsdata:
trainingsdatenForm.addEventListener("submit", submitFormT);
// Event listener Modell:
modellForm.addEventListener("submit", submitFormM);

// Trainingsdata:
// Upload button is activated when a file has been choosen
// Skript Ausführen Button is activated when raster and trainingsdata have been uploaded
trainingsdatenFiles.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (getDateityp(file.name) == "geojson") {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event) => {
      const content = event.target.result;
      const json = JSON.parse(content);
      console.log(json);
      console.log(validateGeoJSON(json));
      if (validateGeoJSON(json)) {
        trainingsdatenHochladen.disabled = false;
        document.getElementById("error").style.display = "none";
      } else {
        trainingsdatenHochladen.disabled = true;
        document.getElementById("error").style.display = "block";
      }
    };
  } else {
    trainingsdatenHochladen.disabled = false;
    document.getElementById("error").style.display = "none";
  }
});
trainingsdatenHochladen.disabled = true;
trainingsdatenForm.reset();

// Model:
// Trainingsdata:
// Upload button is activated when a file has been choosen
// Skript Ausführen Button is activated when raster and model have been uploaded
modelFiles.addEventListener("change", () => {
  modellHochladen.disabled = false;
});
modellHochladen.disabled = true;
modellForm.reset();

/**
 * if Trainingsdata has been uploaded:
 * @param {*} e
 */
function submitFormT(e) {
  if (document.getElementById("rasterdatenFiles").value != "") {
    skriptAusfuehren.disabled = false;
    smallText.style.display = "none";
  }
  e.preventDefault();
  let formData = new FormData();

  formData.append("daten", trainingsdatenFiles.files[0]);
  var dateiname = trainingsdatenFiles.files[0].name;

  // Datatype is asked an set
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

      // different labels are saved in a set
      let labels = new Set();
      data.json.features.forEach((element) => {
        labels.add(element.properties.Label);
      });
      // set is turned into an arry
      const labelsArray = Array.from(labels);
      let layerArray = [];
      // for every element in labes is a different color generated
      for (let index = 0; index < labelsArray.length; index++) {
        let label = labelsArray[index];
        color = getRandomColor();
        // for every element with the same label the same color is attached
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

/**
 * if a model is uploaded:
 * @param {*} e
 */
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
