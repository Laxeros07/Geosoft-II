var rasterdaten = null;
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
    };
    fr.readAsDataURL(files[0]);
  }
}

function uploadRasterdaten() {
  fetch("http://localhost:3000/upload", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "image/tiff",
    },
    body: rasterdaten,
  })
    .then((response) => response)
    .then((data) => {
      console.log("Success:", data);
      //showRasterdaten(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function showrasterdaten(data) {
  var jsonLayer = L.geoJSON(data).addTo(map);
  alert("Hochladen erfolgreich!");

  map.fitBounds(jsonLayer.getBounds());
}
