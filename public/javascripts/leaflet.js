// Karte mit Zentrum definieren
var map = L.map("map").setView([51.96, 7.62], 13);

mapLink = '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; " + mapLink + " Contributors",
  maxZoom: 18,
}).addTo(map);

// var LeafIcon = L.Icon.extend({
//   options: {
//     shadowUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
//     iconSize: [38, 95],
//     shadowSize: [50, 64],
//     iconAnchor: [22, 94],
//     shadowAnchor: [4, 62],
//     popupAnchor: [-3, -76],
//   },
// });

// var greenIcon = new LeafIcon({
//   iconUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
// });
