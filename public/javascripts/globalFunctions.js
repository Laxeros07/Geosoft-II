function addGeoJSONToMap(url, pMap, pLayerControl) {
  // this requests the file and executes a callback with the parsed result once it is available
  fetchJSONFile(url, function (data) {
    // Die verschiedenen Labels werden in einem Set gespeichert
    let labels = new Set();
    data.features.forEach((element) => {
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
      data.features.forEach((element) => {
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
    let group = L.layerGroup(layerArray).addTo(pMap);
    pLayerControl.addOverlay(group, "Trainingspolygone");
  });
}

/**
 * Ruft eine lokale JSON Datei auf
 * Quelle: https://stackoverflow.com/questions/14388452/how-do-i-load-a-json-object-from-a-file-with-ajax
 * @param {*} path
 * @param {*} callback
 */

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

function addGeotiffToMap(url, pMap, pLayerControl) {
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        var layer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256,
          pixelValuesToColorFn: (values) => {
            let maxs = georaster.maxs;
            let mins = georaster.mins;

            values[0] = Math.round(
              (255 / (4000 - mins[0])) * (values[0] - mins[0])
            );
            values[1] = Math.round(
              (255 / (4000 - mins[1])) * (values[1] - mins[1])
            );
            values[2] = Math.round(
              (255 / (4000 - mins[2])) * (values[2] - mins[2])
            );

            // make sure no values exceed 255
            values[0] = Math.min(values[0], 255);
            values[1] = Math.min(values[1], 255);
            values[2] = Math.min(values[2], 255);

            // treat all black as no data
            if (values[0] === 0 && values[1] === 0 && values[2] === 0)
              return null;

            return `rgb(${values[2]}, ${values[1]}, ${values[0]})`;
          },
          /*
        pixelValuesToColorFn: (values) =>
          values[0] > 255
            ? null
            : `rgb(${values[0]},${values[1]},${values[2]})`,*/
        });
        layer.addTo(pMap);

        pLayerControl.addOverlay(layer, "Rasterbild");

        pMap.fitBounds(layer.getBounds());
      });
    });
}

function addPredictionAndAoaToMap(predUrl, aoaUrl, pMap, pLayerControl) {
  fetch(predUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        var layer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256 /**,
          pixelValuesToColorFn: (values) => {
            let maxs = georaster.maxs;
            let mins = georaster.mins;

            values[0] = Math.round(
              (255 / (4000 - mins[0])) * (values[0] - mins[0])
            );
            values[1] = Math.round(
              (255 / (4000 - mins[1])) * (values[1] - mins[1])
            );
            values[2] = Math.round(
              (255 / (4000 - mins[2])) * (values[2] - mins[2])
            );

            // make sure no values exceed 255
            values[0] = Math.min(values[0], 255);
            values[1] = Math.min(values[1], 255);
            values[2] = Math.min(values[2], 255);

            // treat all black as no data
            if (values[0] === 0 && values[1] === 0 && values[2] === 0)
              return null;

            return `rgb(${values[2]}, ${values[1]}, ${values[0]})`;
          },*/,
        });
        layer.addTo(pMap);

        pLayerControl.addOverlay(layer, "Klassifikation");

        pMap.fitBounds(layer.getBounds());
      });
    });

  fetch(aoaUrl)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      parseGeoraster(arrayBuffer).then((georaster) => {
        console.log("georaster:", georaster);

        var layer = new GeoRasterLayer({
          georaster: georaster,
          resolution: 256,
        });
        layer.addTo(pMap);

        pLayerControl.addOverlay(layer, "AOA");

        pMap.fitBounds(layer.getBounds());
      });
    });
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// checkt, ob das Dateiformat Geopackage ist
function getDateityp(name) {
  extension = name.toString().split(".")[1];
  //console.log(extension);
  return extension;
}
