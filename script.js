let manualOverride = false;
let manualStatus = "";

function getStatus() {
  if (manualOverride) {
    setStatus(manualStatus, null);
    return;
  }

  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  const estOffset = -4;
  const estHour = (hour + estOffset + 24) % 24;

  let status = "Online";
  let className = "online";
  let backIn = "";

  if (estHour >= 22 || estHour < 6) {
    status = "Sleeping";
    className = "sleeping";
    const wakeUpHour = 6.5;
    let hoursLeft = wakeUpHour - estHour;
    if (hoursLeft < 0) hoursLeft += 24;
    backIn = `Will be back in ${hoursLeft.toFixed(1)} hrs`;
  } else if (day >= 1 && day <= 5 && estHour >= 7.5 && estHour < 14.5) {
    status = "At School";
    className = "school";
  } else if (estHour >= 14.5 && estHour < 15.5) {
    status = "On Break";
    className = "break";
  } else if (estHour >= 15.5 && estHour < 22) {
    status = "Online";
    className = "online";
  } else {
    status = "Offline";
    className = "offline";
  }

  setStatus(status, className, backIn);
}

function setStatus(status, className, backIn = "") {
  const statusElement = document.getElementById("status");
  const countdownElement = document.getElementById("countdown");

  statusElement.textContent = status;
  statusElement.className = "status " + (className || status.toLowerCase().replace(" ", ""));

  countdownElement.textContent = backIn;
}

// Loader screen
setTimeout(() => {
  getStatus();
  const loader = document.getElementById("loader");
  const container = document.querySelector(".container");

  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
    container.style.display = "block";
  }, 800);
}, 1200);

setInterval(getStatus, 60000);

// Manual override handling
function openPassword() {
  document.getElementById("password-popup").classList.remove("hidden");
}

function checkPassword() {
  const input = document.getElementById("password-input").value;
  const correctPassword = "secret123"; // 🔒 CHANGE THIS

  if (input === correctPassword) {
    document.getElementById("password-popup").classList.add("hidden");
    document.getElementById("manual-status").classList.remove("hidden");
  } else {
    alert("Wrong password 👀");
  }
}

function manualSelect() {
  const selected = document.getElementById("status-select").value;
  if (selected) {
    manualOverride = true;
    manualStatus = selected;
    setStatus(selected, selected.toLowerCase().replace(" ", ""));
  }
}
