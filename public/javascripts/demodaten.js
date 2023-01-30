/**
 * GeoJSON objects are added to the map through a GeoJSON layer.
 * To create it and add it to a map, we can use the following code
 * a function that styles individual features based on their properties
 */

let trainingspolygone = L.layerGroup().addTo(map);

// let labels = new Set();
// trainingsgebiete.features.forEach((element) => {
//   labels.add(element.properties.Label);
// });

// const labelsArray = Array.from(labels);
// console.log(labels);

// for (let index = 0; index < labelsArray.length; index++) {
//   let label = labelsArray[index];
//   console.log(label);
//   color = getRandomColor();

//   trainingsgebiete.features.forEach((element) => {
//     if (element.properties.Label == label) {
//       L.geoJSON(element, {
//         style: {
//           color: color,
//           fillColor: color,
//           weight: 3,
//           opacity: 1,
//           fillOpacity: 0.65,
//         },
//       }).addTo(map);
//     }
//   });
// }

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
    return layer.feature.properties.Label;
  });

layerControl.addOverlay(trainingsgebiete, "Trainingspolygone");

// This function is run for every feature found in the geojson file. It adds the feature to the empty layer we created above
function addMyData(feature, layer) {
  trainingspolygone.addLayer(layer);
}

addGeotiffToMap("../beispieldaten/rasterdaten.tif");

// var info = L.control();

// info.onAdd = function (map) {
//   this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
//   this.update();
//   return this._div;
// };

// // method that we will use to update the control based on feature properties passed
// info.update = function (props) {
//   this._div.innerHTML =
//     "<h4>Trainingspolygone Münster</h4>" +
//     (props
//       ? "<b>" +
//         props.id +
//         "</b><br />" +
//         props.Label +
//         " people / mi<sup>2</sup>"
//       : "Hover over a state");
// };

// info.addTo(map);

// function highlightFeature(e) {
//   var layer = e.target;
//   layer.setStyle({
//     weight: 5,
//     color: "#666",
//     dashArray: "",
//     fillOpacity: 0.7,
//   });
//   layer.bringToFront();
//   info.update(layer.feature.properties);
// }

// function resetHighlight(e) {
//   geojson.resetStyle(e.target);
//   info.update();
// }

// var legend = L.control({ position: "bottomright" });
