var json = []; //Geojson Array

algorithmus = document.getElementById("algorithmus");
algorithmus.value = "rf";
algorithmus.addEventListener("change", () => {
  switch (algorithmus.value) {
    case "rf":
      document.getElementById("rfAttribute").style.display = "block";
      break;
    case "dt":
      document.getElementById("rfAttribute").style.display = "none";
      break;
  }
});

// Add Data to map
addGeotiffToMap("http://localhost:3000/rasterdaten.tif");
addGeoJSONToMap("http://localhost:3000/trainingsdaten.geojson");
addPredictionAndAoaToMap(
  "http://localhost:3000/prediction.tif",
  "http://localhost:3000/AOA_klassifikation.tif"
);
addDIToMap("http://localhost:3000/maxDI.geojson");
addAoaDifToMap("http://localhost:3000/maxDI.geojson");

var LeafIcon = L.Icon.extend({
  options: {
    shadowUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    iconSize: [38, 95],
    shadowSize: [50, 64],
    iconAnchor: [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor: [-3, -76],
  },
});

var greenIcon = new LeafIcon({
  iconUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
});

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

//Leaflet draw control Bar
var drawControl = new L.Control.Draw({
  position: "topright",
  draw: {
    rectangle: false,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnItems,
  },
});
map.addControl(drawControl);

//Popup Name
var getName = function (layer) {
  var name = prompt("Label:", "Geometrie Name");
  return name;
};

//popup Id
var getID = function (layer) {
  var classID = prompt("ClassID:", "Klassen_Identifikation");
  return classID;
};

map.on(L.Draw.Event.CREATED, function (e) {
  var layer = e.layer,
    feature = (layer.feature = layer.feature || {});
  var name = getName(layer);
  var classID = getID(layer);
  var props = (feature.properties = feature.properties || {}); // Intialize feature.properties
  props.label = name;
  props.classID = classID;
  drawnItems.addLayer(layer);
  if (name == "geometry name") {
    layer.bindPopup("-- no name provided --");
  } else if (name == "") {
    layer.bindPopup("-- no name provided --");
  } else {
    let text = "<b>ClassID:</b> " + classID + "<br>";
    text += "<b>Label:</b> " + name;
    layer.bindTooltip(text, { permanent: true, direction: "top" });
  }
  drawnItems.addLayer(layer);
  // get json
  console.log(drawnItems.toGeoJSON());
  //json speichern
  json.push(drawnItems.toGeoJSON());
  datenAnzeigen();
});

/**
 * will be excuted if loading button pressed
 */
function datenAnzeigen() {
  console.log("Tabelle leeren");

  // reset table
  tbl = document.getElementById("tabelle");
  tbl.innerHTML =
    "<tbody><tr><th>Id</th><th>Label</th><th>Class_ID</th></tr></tbody>";

  toJson(json);
}

var data = []; //Array für die Geojson
/**
 * save in geojson
 */
function toJson() {
  data = [];
  var i = 0;
  while (i < json.length) {
    data.push({
      type: "Feature",
      properties: {
        id: i,
        ClassID: json[i].features[i].geometry.properties.classID,
        Label: json[i].features[i].geometry.properties.label,
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [json[i].features[i].geometry.geometry.coordinates],
      },
    });
    i++;
  }
  console.log(data);
  einlesen(data); // give values to table
}

// add points and attributes to table
const table = document.getElementById("tabelle");

/**
 * add data (Label & Class_ID) to table
 */
function einlesen() {
  data.forEach((item) => {
    let row = table.insertRow(-1);
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);

    // Saving of number an attribute in every row
    cell0.innerHTML = item.properties.id;
    cell1.innerHTML = item.properties.Label;
    cell2.innerHTML = item.properties.ClassID;
  });

  tabelleFüllen(json);
}

function tabelleFüllen() {
  const table = document.getElementById("tabelle");

  /**
   * Klick-Event-for row in table-zoom to feature
   * open pop-up
   * source: stackoverflow https://stackoverflow.com/questions/1207939/adding-an-onclick-event-to-a-table-row
   */
  function addRowHandlers() {
    var table = document.getElementById("tabelle");
    var rows = table.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++) {
      var currentRow = table.rows[i];
      var createClickHandler = function (row) {
        return function () {
          var cell = row.getElementsByTagName("td")[0].innerHTML;
          var xy = findXY(cell);
          console.log(xy);
          var y = xy[0];
          console.log(y);
          var x = xy[1];
          map.setView([x, y], 20);
          //markerArray[id - 1].openPopup();
        };
      };

      currentRow.onclick = createClickHandler(currentRow);
    }
  }
  window.onload = addRowHandlers();
}

/**
 * find correct coordinates for class_ID
 */
function findXY(cell) {
  console.log("sucht");
  var xy = [];
  var i = 0;
  while (data.length > i) {
    console.log("lauft");
    if (data[i].properties.id == cell) {
      xy = data[i].geometry.coordinates[0][0][1];
      console.log("gefunden" + xy);
    }
    i++;
  }
  return xy;
}

/**
 * Trainingsdaten exportieren
 * https://github.com/anshori/leaflet-draw-to-geojson-file/blob/master/assets/js/app.js
 */
// Export Button
// var showExport =
//   '<a href="#" onclick="datenAnzeigen()" title="Export to GeoJSON File" type="button" class="btn btn-danger btn-sm text-light"><i class="fa fa-file-code-o" aria-hidden="true"></i> laden</a>';

// var showExportButton = new L.Control({ position: "topright" });
// showExportButton.onAdd = function (map) {
//   this._div = L.DomUtil.create("div");
//   this._div.innerHTML = showExport;
//   return this._div;
// };
// showExportButton.addTo(map);

// Export to GeoJSON File
function geojsonExport() {
  // old tariningspolygones are pushed into an array
  oldLayer = [];
  geojsonLayer.forEach((item) => {
    fc = item.toGeoJSON();
    oldLayer.push(fc.features[0]);
  });

  let nodata = '{"type":"FeatureCollection","features":[]}';

  // morphing of old and new trainingsdata
  let jsonData = {
    type: "FeatureCollection",
    name: "trainingsgebiete",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: data.concat(oldLayer),
  };

  // giving each feature an iconic ID
  for (let i = 0; i < jsonData.features.length; i++) {
    jsonData.features[i].properties.id = i + 1;
  }

  let string = JSON.stringify(jsonData);
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(string);
  let datenow = new Date();
  let datenowstr = datenow.toLocaleDateString("en-GB");
  let exportFileDefaultName = "export_draw_" + datenowstr + ".geojson";
  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  if (string == nodata) {
    alert("No features are drawn");
  } else {
    // Download
    linkElement.click();
  }
}

/**
 * uploading the geojson
 */
function geojsonHochladen() {
  oldLayer = [];
  geojsonLayer.forEach((item) => {
    fc = item.toGeoJSON();
    oldLayer.push(fc.features[0]);
  });

  let jsonData = {
    type: "FeatureCollection",
    name: "trainingsgebiete",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: data.concat(oldLayer),
  };

  fetch("http://localhost:3000/result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonData),
  })
    .then((response) => {
      console.log(response);
      window.alert("Hochladen erfolgreich");
    })
    .catch((error) => console.error("Error:", error));
}

/**
 * input of tree numbers has to be an integer between 0 and 1000
 */
setInputFilter(
  document.getElementById("baumAnzahl"),
  function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000);
  },
  "Must be between 0 and 1000"
);
setInputFilter(
  document.getElementById("baumTiefe"),
  function (value) {
    return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 1000);
  },
  "Must be between 0 and 1000"
);

/**
 * sets input filter for Baumtiefe and Baumanzahl
 * @param {*} textbox
 * @param {*} inputFilter
 * @param {*} errMsg
 */
function setInputFilter(textbox, inputFilter, errMsg) {
  [
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mouseup",
    "select",
    "contextmenu",
    "drop",
    "focusout",
  ].forEach(function (event) {
    textbox.addEventListener(event, function (e) {
      if (inputFilter(this.value)) {
        // Accepted value
        if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
          this.classList.remove("input-error");
          this.setCustomValidity("");
        }
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        // Rejected value - restore the previous one
        this.classList.add("input-error");
        this.setCustomValidity(errMsg);
        this.reportValidity();
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        // Rejected value - nothing to restore
        this.value = "";
      }
    });
  });
}
const skriptAusfuehren = document.getElementById("skriptAusfuehren");
skriptAusfuehren.addEventListener("click", showLoadingScreen);
const loading = document.getElementById("loading");
function showLoadingScreen() {
  loading.style.display = "block";
}
