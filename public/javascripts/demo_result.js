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
