// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyBS3R4MIYvo3rWvFlmT3anBnpPRMyC3wdA",
  authDomain: "enzostatus-e717f.firebaseapp.com",
  databaseURL: "https://enzostatus-e717f-default-rtdb.firebaseio.com",
  projectId: "enzostatus-e717f",
  storageBucket: "enzostatus-e717f.appspot.com",
  messagingSenderId: "232951174632",
  appId: "1:232951174632:web:d2d57c74ac1069fd4c405d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const statusRef = db.ref("status");
const manualRef = db.ref("manualOverride");

// DOM refs
const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const manualBox = document.getElementById("manual-status");

const passwordPopup = document.getElementById("password-popup");
const passwordInput = document.getElementById("password-input");
const passwordSubmit = document.getElementById("password-submit");
const passwordCancel = document.getElementById("password-cancel");
const enzoStatus = document.getElementById("enzo-status-text");

enzoStatus.addEventListener("click", () => {
  passwordInput.value = "";
  passwordPopup.classList.remove("hidden");
  passwordInput.focus();
});

passwordSubmit.addEventListener("click", () => {
  if (passwordInput.value === "yourPasswordHere") {
    manualBox.classList.remove("hidden");
    passwordPopup.classList.add("hidden");
  } else {
    alert("Incorrect password.");
  }
});

passwordCancel.addEventListener("click", () => {
  passwordPopup.classList.add("hidden");
});

// Loader dots + fade
const dots = document.getElementById("dots");
let dotCount = 1;
setInterval(() => {
  dotCount = (dotCount % 3) + 1;
  dots.textContent = ".".repeat(dotCount);
}, 500);

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("loader").style.display = "none";
      document.body.classList.add("loaded");
      loadStatus();
      loadProjects();
    }, 1000);
  }, 2000);
});

// Status handling
function loadStatus() {
  manualRef.on("value", (snap) => {
    const isManual = snap.val();
    if (isManual) {
      statusRef.once("value").then(snap => {
        const val = snap.val();
        updateStatus(val);
      });
    } else {
      autoStatus();
    }
  });
}

function autoStatus() {
  const now = new Date();
  const estHour = (now.getUTCHours() - 4 + 24) % 24;
  const day = now.getDay();

  let status = "Online";

  if (estHour >= 22 || estHour < 6) status = "Sleeping";
  else if (estHour >= 7 && estHour < 14 && day >= 1 && day <= 5) status = "At School";
  else if (estHour >= 14 && estHour < 15) status = "On Break";

  updateStatus(status);
}

function updateStatus(status) {
  statusEl.textContent = status;
  statusEl.className = "status " + status.toLowerCase().replace(/\s/g, "");

  if (status === "Sleeping") {
    const now = new Date();
    const wake = new Date();
    wake.setUTCHours(10, 30, 0, 0); // 6:30 AM EST
    if (now > wake) wake.setDate(wake.getDate() + 1);
    const diff = wake - now;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    countdownEl.textContent = `Back in ${hrs}h ${mins}m`;
  } else {
    countdownEl.textContent = "";
  }
}

// Manual override
document.getElementById("set-status-btn").addEventListener("click", () => {
  const selected = document.getElementById("status-select").value;
  if (!selected) return;
  statusRef.set(selected);
  manualRef.set(true);
  updateStatus(selected);
  manualBox.classList.add("hidden");
});

document.getElementById("reset-status-btn").addEventListener("click", () => {
  manualRef.set(false);
  statusRef.set("");
  manualBox.classList.add("hidden");
  autoStatus();
});

// Project data
const currentProjects = ["IFE system", "Grill UI", "Status Site"];
const upcomingProjects = ["Flight Tracker", "Live Check-in System"];

function loadProjects() {
  const currentList = document.getElementById("current-projects-list");
  const upcomingList = document.getElementById("upcoming-projects-list");

  currentProjects.forEach(proj => {
    const li = document.createElement("li");
    li.textContent = proj;
    currentList.appendChild(li);
  });

  upcomingProjects.forEach(proj => {
    const li = document.createElement("li");
    li.textContent = proj;
    upcomingList.appendChild(li);
  });
}
