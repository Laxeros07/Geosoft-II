function addGeotiffToMap(url) {
  var url = "../beispieldaten/sentinelRaster2_umprojiziert.tif";

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
        layer.addTo(map);

        layerControl.addOverlay(layer, "Rasterbild");

        map.fitBounds(layer.getBounds());
      });
    });
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  console.log(color);
  return color;
}

// checkt, ob das Dateiformat Geopackage ist
function getDateityp(name) {
  extension = name.toString().split(".")[1];
  //console.log(extension);
  return extension;
}
