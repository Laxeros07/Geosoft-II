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
}
// Modell:
function hideModellForm() {
  modellForm.style.display = "block"; // <-- Set it to block
  trainingsdatenKnopf.style.display = "block"; // <-- Set it to block
  trainingsdatenForm.style.display = "none";
  modellKnopf.style.display = "none";
  document.getElementById("idInput").value = "modell";
}
// Trainingsdaten:
trainingsdatenForm.addEventListener("submit", submitFormT);
// Modell:
modellForm.addEventListener("submit", submitFormM);

// Trainingsdaten:
// Hochladen Button wird aktiviert, wenn etwas hochgeladen wurde
// Skript Ausführen Button wird aktiviert, wenn Raster- und Trainingsdaten vorliegen
trainingsdatenFiles.addEventListener("change", () => {
  trainingsdatenHochladen.disabled = false;
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
  //for (let i = 0; i < files.files.length; i++) {
  //  formData.append("files", files.files[i]);
  //}
  for (var [key, value] of formData.entries()) {
    console.log(key, value);
  }
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
      //GeoJSON
      if (
        getDateityp(dateiname) == "geojson" ||
        getDateityp(dateiname) == "json"
      ) {
        /*
        var geojsonLayer = new L.GeoJSON.AJAX(
          "../uploads/trainingsdaten." + getDateityp(dateiname)
        );
        
        geojsonLayer.addTo(map).bindPopup(function (layer) {
          return layer.feature.properties.Label;
        });
        */
      }

      // this requests the file and executes a callback with the parsed result once it is available
      //fetchJSONFile("../uploads/trainingsdaten.geojson", function (data) {

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
                return layer.feature.properties.Label;
              })
            );
          }
        });
      }
      let group = L.layerGroup(layerArray).addTo(map);
      layerControl.addOverlay(group, "Trainingspolygone");
      //});
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
  //for (let i = 0; i < files.files.length; i++) {
  //  formData.append("files", files.files[i]);
  //}
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

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

//Leaflet draw control Bar
var drawControl = new L.Control.Draw({
  position: "topright",
  draw: {
    rectangle: true,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false,
    polygon: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);
var maske;
map.on("draw:created", function (e) {
  layer = e.layer;
  maske = [
    layer._bounds._southWest.lng,
    layer._bounds._northEast.lng,
    layer._bounds._southWest.lat,
    layer._bounds._northEast.lat,
  ];
  console.log(maske);
  drawnItems.addLayer(layer);
});
/**
 * Ruft eine lokale JSON Datei auf
 * Quelle: https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
 * @param {*} path
 * @param {*} callback
 */
/*
function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function () {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}
*/
//trainingsdatenInput.addEventListener("change", fileTrainingChange);
//trainingsdatenHochladen.addEventListener("click", uploadTrainingsdaten);

/*
function showTrainingsdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}
*/
/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/23344776/how-to-access-data-of-uploaded-json-file
 * @param {*} event
 */

/** 
function fileTrainingChange(event) {
  var reader = new FileReader();
  reader.onload = (event) => {
    trainingsdaten = event.target.result;
    console.log(trainingsdaten);
    //console.log(trainingsdatenInput);

    //uploadTrainingsdaten();
  };
  console.log(event.target.files[0].name);
  reader.readAsText(event.target.files[0]);
  dateiname = event.target.files[0].name;
  console.log(dateiname);
  /*
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(event.target.files[0]); //your file(s) reference(s)
  trainingsdatenInput.files = dataTransfer.files;
  */
//}

/**
 * Trainingsdaten in die Mongodb laden
 * Trainingsdaten in die Mongodb laden
 */

/**
function uploadTrainingsdaten() {
  if (getDateityp(dateiname)) {
    if (getDateityp(dateiname)) {
      // falls geopackage dateiformat
      // an dieser STelle R Skript ausführen um in geojson umzuwandeln
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: trainingsdaten, //toGeojson(trainingsdaten),
      })
        //.then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      // falls geojseon dateiformat
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: trainingsdaten,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      // falls geojseon dateiformat
      fetch("http://localhost:3000/upload", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: trainingsdaten,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          showTrainingsdaten(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  function showTrainingsdaten(data) {
    var jsonLayer = L.geoJSON(data).addTo(map);
    alert("Hochladen erfolgreich!");

    map.fitBounds(jsonLayer.getBounds());
  }



  function toGeojson(x) {
    var geojsonRahmen = {
      trainingsdaten: null,
      geopackage: null,
    };
    geojsonRahmen.trainingsdaten = x;
    geojsonRahmen.geopackage = true;
    console.log(geojsonRahmen);
    return JSON.stringify({ geojsonRahmen });
    extension = name.toString().split(".")[1];
    console.log(extension);
    if (extension == "gpkg") {
      return true;
    } else {
      return false;
    }
  }
}
 */
