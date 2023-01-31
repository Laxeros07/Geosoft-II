// Karte mit Zentrum definieren
var map = L.map("map").setView([51.96, 7.62], 13);

mapLink = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map);

var satellite = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
).addTo(map);

var baseMaps = {
  Luftbild: satellite,
  OpenStreetMap: osm,
};

var layerControl = L.control.layers(baseMaps).addTo(map);
