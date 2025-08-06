const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const manualStatusBox = document.getElementById("manual-status");
const loader = document.getElementById("loader");

let manualOverride = localStorage.getItem("manualOverride") === "true";
let manualStatus = localStorage.getItem("manualStatus") || "";

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.display = "none";
    document.querySelector(".container").style.display = "block";
    getStatus();
  }, 5000);
});

function getStatus() {
  if (manualOverride && manualStatus) {
    updateStatus(manualStatus);
    return;
  }

  const now = new Date();
  const utcHour = now.getUTCHours();
  const estHour = (utcHour - 4 + 24) % 24;
  const day = now.getDay();

  let status = "Online";

  if (estHour >= 22 || estHour < 6) {
    status = "Sleeping";
  } else if (estHour >= 7 && estHour < 14 && day >= 1 && day <= 5) {
    status = "At School";
  } else if (estHour >= 14 && estHour < 15) {
    status = "On Break";
  }

  updateStatus(status);
}

function updateStatus(status) {
  const lower = status.toLowerCase().replace(/\s+/g, '');
  statusEl.className = "status " + lower;
  statusEl.textContent = status;

  if (status === "Sleeping") {
    const now = new Date();
    const wake = new Date();
    wake.setUTCHours(10, 30, 0, 0); // 6:30 AM EST = 10:30 UTC
    if (now > wake) wake.setDate(wake.getDate() + 1);

    const diff = wake - now;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    countdownEl.textContent = `Back in ${hrs}h ${mins}m`;
  } else {
    countdownEl.textContent = "";
  }
}

function openManualBox() {
  document.getElementById("password-popup").classList.remove("hidden");
}

function submitPassword() {
  const input = document.getElementById("password-input").value;
  if (input === "VBal55001") {
    document.getElementById("password-popup").classList.add("hidden");
    manualStatusBox.classList.remove("hidden");
  } else {
    alert("Incorrect password.");
  }
}

function manualSelect() {
  const selected = document.getElementById("status-select").value;
  if (!selected) return;

  manualOverride = true;
  manualStatus = selected;

  localStorage.setItem("manualOverride", "true");
  localStorage.setItem("manualStatus", manualStatus);

  updateStatus(manualStatus);

  // 👇 Auto close popup
  manualStatusBox.classList.add("hidden");
}

function resetToAuto() {
  manualOverride = false;
  manualStatus = "";

  localStorage.removeItem("manualOverride");
  localStorage.removeItem("manualStatus");

  getStatus();
  manualStatusBox.classList.add("hidden");
}
