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

// References to the database paths
const statusRef = db.ref('status');
const manualOverrideRef = db.ref('manualOverride');

let manualOverride = false;
let manualStatus = "";

// Loading dots animation
let dotIndex = 0;
const dotsEl = document.getElementById("dots");
setInterval(() => {
  dotIndex = (dotIndex + 1) % 4;
  dotsEl.textContent = '.'.repeat(dotIndex || 1);
}, 500);

// Show loader, then initialize main content
window.addEventListener("load", () => {
  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      document.querySelector(".container").style.display = "block";
      listenForStatusChanges();
    }, 800);
  }, 5000); // Adjust loader display time here
});

// Listen for status changes in Firebase
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

// Auto status logic based on EST time
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

// Update status display and countdown if sleeping
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

// Password prompt to open manual status override
function openManualBox() {
  const pass = prompt("Enter password to change status:");
  if (pass === "yourPasswordHere") {
    manualStatusBox.classList.remove("hidden");
  } else {
    alert("Incorrect password.");
  }
}

// Called when user selects a manual status from dropdown
function manualSelect() {
  const selected = document.getElementById("status-select").value;
  if (!selected) return;

  manualOverride = true;
  manualStatus = selected;

  // Update Firebase
  statusRef.set(manualStatus);
  manualOverrideRef.set(true);

  updateStatus(manualStatus);
  manualStatusBox.classList.add("hidden");
}

// Reset to automatic status mode
function resetToAuto() {
  manualOverride = false;
  manualStatus = "";

  manualOverrideRef.set(false);
  statusRef.set("");

  manualStatusBox.classList.add("hidden");
  autoStatus();
}
