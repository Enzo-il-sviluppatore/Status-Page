const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const manualStatusBox = document.getElementById("manual-status");
const loader = document.getElementById("loader");

let manualOverride = localStorage.getItem("manualOverride") === "true";
let manualStatus = localStorage.getItem("manualStatus") || "";

window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.display = "none";
    getStatus();
  }, 1500); // loader stays for 1.5s
});

function getStatus() {
  if (manualOverride && manualStatus) {
    updateStatus(manualStatus);
    return;
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay();

  let status = "Online";

  // EST correction (if server is UTC, adjust here if needed)
  const estHour = hour;

  if (estHour >= 22 || estHour < 6) {
    status = "Sleeping";
  } else if (estHour >= 6 && estHour < 7) {
    status = "Waking Up";
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

  // Handle countdown if sleeping
  if (status === "Sleeping") {
    const now = new Date();
    const wake = new Date(now);
    wake.setHours(6, 30, 0, 0);
    if (now > wake) wake.setDate(wake.getDate() + 1);

    const diff = wake - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    countdownEl.textContent = `Back in ${hours}h ${mins}m`;
  } else {
    countdownEl.textContent = "";
  }
}

// Open manual entry popup
function openManualBox() {
  const pass = prompt("Enter password to change status:");
  if (pass === "yourPasswordHere") {
    manualStatusBox.classList.remove("hidden");
  } else {
    alert("Incorrect password.");
  }
}

// Manual status select
function manualSelect() {
  const selected = document.getElementById("status-select").value;
  if (!selected) return;

  manualOverride = true;
  manualStatus = selected;

  localStorage.setItem("manualOverride", "true");
  localStorage.setItem("manualStatus", manualStatus);

  updateStatus(manualStatus);
}

// Reset back to auto
function resetToAuto() {
  manualOverride = false;
  manualStatus = "";
  localStorage.removeItem("manualOverride");
  localStorage.removeItem("manualStatus");

  getStatus();
  manualStatusBox.classList.add("hidden");
}
