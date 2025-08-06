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
  }, 1500);
});

function getStatus() {
  if (manualOverride && manualStatus) {
    updateStatus(manualStatus);
    return;
  }

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  let status = "Online";

  if (hour >= 22 || hour < 6) {
    status = "Sleeping";
  } else if (hour >= 7 && hour < 14 && day >= 1 && day <= 5) {
    status = "At School";
  } else if (hour >= 14 && hour < 15) {
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
    wake.setHours(6, 30, 0, 0);
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
  const pass = prompt("Enter password to change status:");
  if (pass === "yourPasswordHere") {
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
}

function resetToAuto() {
  manualOverride = false;
  manualStatus = "";

  localStorage.removeItem("manualOverride");
  localStorage.removeItem("manualStatus");

  getStatus();
  manualStatusBox.classList.add("hidden");
}
