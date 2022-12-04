var map = L.map("map").setView([51.97, 7.62], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let x = document.getElementById("coordinates");
/**
 * Returns the Geolocation of the browser
 * @returns {coordinates}
 */
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

let pos;
/**
 * shows the position of the browser
 * @param {coordinates} position
 */
function showPosition(position) {
  x.innerHTML =
    "Latitude: " +
    position.coords.latitude +
    ",  Longitude: " +
    position.coords.longitude;

  pos = [position.coords.latitude, position.coords.longitude];
  var marker = new L.marker([pos[0], pos[1]]);
  marker.bindPopup("mein Standort");
  marker.addTo(map);
}
