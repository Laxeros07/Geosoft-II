var rasterdaten = null;
var bbox;

var rasterdatenInput = document.getElementById("rasterdatenInput");
var rasterdatenHochladen = document.getElementById("rasterdatenHochladen");

//rasterdatenInput.addEventListener("change", (event) => fileRasterChange(event));
//rasterdatenHochladen.addEventListener("click", uploadRasterdaten);

/**
 * Wird ausgeführt, wenn eine Datei hochgeladen wurde.
 * Quelle: https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
 * @param {*} event
 */
function fileRasterChange(evt) {
  var tgt = evt.target || window.event.srcElement,
    files = tgt.files;

  // FileReader support
  if (FileReader && files && files.length) {
    var fr = new FileReader();
    fr.onload = function () {
      rasterdaten = fr.result;
      console.log(GeoTIFF);
      GeoTIFF.fromBlob(files[0]).then((f) => {
        f.getImage().then((f2) => {
          const width = f2.getWidth();
          const height = f2.getHeight();
          const tileWidth = f2.getTileWidth();
          const tileHeight = f2.getTileHeight();
          const samplesPerPixel = f2.getSamplesPerPixel();

          // when we are actually dealing with geo-data the following methods return
          // meaningful results:
          const origin = f2.getOrigin();
          const resolution = f2.getResolution();
          bbox = f2.getBoundingBox();

          var imageUrl = rasterdaten;
          var imageBounds = [
            [40.712216, -74.22655],
            [40.773941, -74.12544],
          ];
          L.imageOverlay(imageUrl, bbox).addTo(map).bringToFront();

          map.fitBounds(imageBounds);
        });
      });
    };
    fr.readAsDataURL(files[0]);
  }
}

function uploadRasterdaten() {
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: rasterdaten,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  /*
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: { "Content-Type": "application/json" },
    body: rasterdaten,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      //showRasterdaten(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });*/
}

function showrasterdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}
