function startCountdown() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );

  const timeLeft = midnight - now;
  const hours = formatNumber(Math.floor(timeLeft / 1000 / 60 / 60));
  const minutes = formatNumber(Math.floor(timeLeft / 1000 / 60) % 60);
  const seconds = formatNumber(Math.floor(timeLeft / 1000) % 60);

  document.getElementById("hours").innerHTML = " " + hours + ":";
  document.getElementById("minutes").innerHTML = minutes + ":";
  document.getElementById("seconds").innerHTML = seconds;

  setTimeout(startCountdown, 1000);
}

startCountdown();

function formatNumber(num) {
  return num < 10 ? "0" + num : num;
}
