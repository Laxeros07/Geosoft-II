let trainingspolygone = L.layerGroup().addTo(map);

var trainingsgebiete = L.geoJSON(trainingsgebiete, {
  onEachFeature: addMyData,
  style: function (feature) {
    switch (feature.properties.Label) {
      case "See":
        return { color: "#0a1cb1" };
      case "Siedlung":
        return { color: "#e57423" };
      case "FLiessgewaesser":
        return { color: "#23c3e5" };
      case "Laubwald":
        return { color: "#2aa43d" };
      case "Mischwald":
        return { color: "#11671e" };
      case "Gruenland":
        return { color: "#92e597" };
      case "Industriegebiet":
        return { color: "#696969" };
      case "Acker_bepflanzt":
        return { color: "#70843a" };
      case "Offenboden":
        return { color: "#472612" };
    }
  },
})
  .addTo(map)
  .bindPopup(function (layer) {
    let text = "<b>ClassID:</b> " + layer.feature.properties.ClassID + "<br>";
    text += "<b>Label:</b> " + layer.feature.properties.Label;
    return text;
  });

layerControl.addOverlay(trainingsgebiete, "Trainingspolygone");

// This function is run for every feature found in the geojson file. It adds the feature to the empty layer we created above
function addMyData(feature, layer) {
  trainingspolygone.addLayer(layer);
}

addGeotiffToMap("../beispieldaten/rasterdaten.tif");

addPredictionAndAoaToMap(
  "../beispieldaten/prediction.tif",
  "../beispieldaten/AOA_klassifikation.tif"
);

//Legende

// AoA
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>AoA</h4>";
  div.innerHTML +=
    '<i style="background: #000"></i><span>Gute Klassifikation</span><br>';
  div.innerHTML +=
    '<i style="background: #fff"></i><span>Schlechte Klassifikation</span><br>';
  return div;
};

legend.addTo(map);

// Klassifizierung
var legend2 = L.control({ position: "bottomleft" });

legend2.onAdd = function () {
  var img = L.DomUtil.create("img", "legend");
  img.src += "../beispieldaten/legend.png";
  return img;
};

legend2.addTo(map);

function downloadZip(e) {
  e.preventDefault();
  let data = {};
  fetch("http://localhost:3000/demo", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      // The response is a Response instance.
      // You parse the data into a useable format using `.json()`
      console.log(response);
      return response.blob();
    })
    .then(function (blob) {
      var binaryData = [];
      binaryData.push(blob);
      downloadBlob(binaryData, "test.zip");
    });
}

function downloadBlob(binaryData, filename) {
  // Create an object URL for the blob object
  const url = URL.createObjectURL(
    new Blob(binaryData, { type: "application/zip" })
  );

  // Create a new anchor element
  const a = document.createElement("a");

  // Set the href and download attributes for the anchor element
  // You can optionally set other attributes like `title`, etc
  // Especially, if the anchor element will be attached to the DOM
  a.href = url;
  a.download = filename || "download";

  // Click handler that releases the object URL after the element has been clicked
  // This is required for one-off downloads of the blob content
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      this.removeEventListener("click", clickHandler);
    }, 150);
  };

  // Add the click event listener on the anchor element
  // Comment out this line if you don't want a one-off download of the blob content
  a.addEventListener("click", clickHandler, false);

  // Programmatically trigger a click on the anchor element
  // Useful if you want the download to happen automatically
  // Without attaching the anchor element to the DOM
  // Comment out this line if you don't want an automatic download of the blob content
  a.click();

  // Return the anchor element
  // Useful if you want a reference to the element
  // in order to attach it to the DOM or use it in some other way
  return a;
}
