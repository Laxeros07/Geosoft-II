// creating new layer
let trainingspolygone = L.layerGroup().addTo(map);
// setting color of the polygones according to their label and adding them to the map
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
// adds satellite photo to map
addGeotiffToMap("../beispieldaten/rasterdaten.tif");
