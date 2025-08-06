// Your Firebase config — plug yours in here
const firebaseConfig = {
  apiKey: "AIzaSyBS3R4MIYvo3rWvFlmT3anBnpPRMyC3wdA",
  authDomain: "enzostatus-e717f.firebaseapp.com",
  databaseURL: "https://enzostatus-e717f-default-rtdb.firebaseio.com",
  projectId: "enzostatus-e717f",
  storageBucket: "enzostatus-e717f.firebasestorage.app",
  messagingSenderId: "232951174632",
  appId: "1:232951174632:web:d2d57c74ac1069fd4c405d",
  measurementId: "G-2GCFF7MZKV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const db = firebase.database();

const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const manualStatusBox = document.getElementById("manual-status");
const loader = document.getElementById("loader");

const statusRef = db.ref('status');
const manualOverrideRef = db.ref('manualOverride');

let manualOverride = false;
let manualStatus = "";

// Dots animation on loader
let dotIndex = 0;
const dotsEl = document.getElementById("dots");
setInterval(() => {
  dotIndex = (dotIndex + 1) % 4;
  dotsEl.textContent = '.'.repeat(dotIndex || 1);
}, 500);

// Show loader, then fade in main content
window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      document.querySelector(".container").style.display = "block";
      listenForStatusChanges();
    }, 800);
  }, 5000);
});

// Listen to Firebase status changes
function listenForStatusChanges() {
  statusRef.on('value', (snapshot) => {
    manualOverrideRef.once('value').then((manualSnap) => {
      manualOverride = manualSnap.val();
      manualStatus = snapshot.val();

      if (manualOverride && manualStatus) {
        updateStatus(manualStatus);
      } else {
        autoStatus();
      }
    });
  });
}

// Auto status based on EST time
function autoStatus() {
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

// Update status & countdown
function updateStatus(status) {
  const lower = status.toLowerCase().replace(/\s+/g, '');
  statusEl.className = "status " + lower;
  statusEl.textContent = status;

  if (status === "Sleeping") {
    const now = new Date();
    const wake = new Date();
    wake.setUTCHours(10, 30, 0, 0);
    if (now > wake) wake.setDate(wake.getDate() + 1);

    const diff = wake - now;
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    countdownEl.textContent = `Back in ${hrs}h ${mins}m`;
  } else {
    countdownEl.textContent = "";
  }
}

// Password popup elements
const passwordPopup = document.getElementById("password-popup");
const passwordInput = document.getElementById("password-input");
const passwordSubmit = document.getElementById("password-submit");
const passwordCancel = document.getElementById("password-cancel");
const manualStatusDropdown = document.getElementById("status-select");
const setStatusBtn = document.getElementById("set-status-btn");
const resetStatusBtn = document.getElementById("reset-status-btn");

// Show password popup on click
document.getElementById("enzo-status-text").addEventListener("click", () => {
  passwordInput.value = "";
  passwordPopup.classList.remove("hidden");
  passwordInput.focus();
});

// Password submit handler
passwordSubmit.addEventListener("click", () => {
  const pass = passwordInput.value;
  if (pass === "yourPasswordHere") { // Replace with your password
    passwordPopup.classList.add("hidden");
    manualStatusBox.classList.remove("hidden");
  } else {
    alert("Incorrect password.");
    passwordInput.value = "";
    passwordInput.focus();
  }
});

// Cancel button handler
passwordCancel.addEventListener("click", () => {
  passwordPopup.classList.add("hidden");
  passwordInput.value = "";
});

// Manual status set button
setStatusBtn.addEventListener("click", () => {
  const selected = manualStatusDropdown.value;
  if (!selected) return;

  manualOverride = true;
  manualStatus = selected;

  statusRef.set(manualStatus);
  manualOverrideRef.set(true);

  updateStatus(manualStatus);
  manualStatusBox.classList.add("hidden");
});

// Reset to auto mode button
resetStatusBtn.addEventListener("click", () => {
  manualOverride = false;
  manualStatus = "";

  manualOverrideRef.set(false);
  statusRef.set("");

  manualStatusBox.classList.add("hidden");
  autoStatus();
});
