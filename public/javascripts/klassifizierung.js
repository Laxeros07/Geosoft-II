const skriptAusfuehren = document.getElementById("skript");
skriptAusfuehren.disabled = true;

const smallText = document.getElementById("small");

skriptAusfuehren.addEventListener("click", showLoadingScreen);
const loading = document.getElementById("loading");
function showLoadingScreen() {
  loading.style.display = "block";
}
