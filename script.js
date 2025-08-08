/* ---------- CONFIG ---------- */
/* Paste your Firebase config object here (or leave as null to use local-only mode) */
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

/* ---------- Setup (Firebase if provided) ---------- */
let useFirebase = false;
let db = null;
let statusRef = null;
let manualRef = null;

if (typeof firebase !== "undefined" && firebaseConfig && firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    statusRef = db.ref("status");
    manualRef = db.ref("manualOverride");
    useFirebase = true;
    console.log("Firebase enabled");
  } catch (e) {
    console.warn("Firebase init failed:", e);
    useFirebase = false;
  }
}

/* ---------- DOM refs ---------- */
const loader = document.getElementById("loader");
const main = document.getElementById("main");
const statusEl = document.getElementById("status");
const countdownEl = document.getElementById("countdown");
const enzoTitle = document.getElementById("enzo-title");
const passwordModal = document.getElementById("password-modal");
const passwordInput = document.getElementById("password-input");
const passwordOk = document.getElementById("password-ok");
const passwordCancel = document.getElementById("password-cancel");
const manualPanel = document.getElementById("manual-panel");
const manualSelect = document.getElementById("manual-select");
const manualSet = document.getElementById("manual-set");
const manualReset = document.getElementById("manual-reset");
const dotsSpan = document.getElementById("dots");
const currentProjectsList = document.getElementById("current-projects");
const upcomingProjectsList = document.getElementById("upcoming-projects");

/* ---------- STATE ---------- */
let manualOverride = false;
let manualStatus = "";
let loaderDots = 1;
let loaderInterval = null;
const PASSWORD = "yourPasswordHere"; // change it

/* ---------- HELPER: Auto status logic (EST) ---------- */
function computeAutoStatus() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const estHour = (utcHour - 4 + 24) % 24; // EST = UTC-4 (adjust daylight/timezone when necessary)
  const day = now.getDay();

  if (estHour >= 22 || estHour < 6) return "Sleeping";
  if (estHour >= 6 && estHour < 7) return "Waking Up";
  if (estHour >= 7 && estHour < 14 && day >= 1 && day <= 5) return "At School";
  if (estHour >= 14 && estHour < 15) return "On Break";
  return "Online";
}

/* ---------- UPDATE STATUS UI ---------- */
function showCountdownForSleeping() {
  const now = new Date();
  const wake = new Date();
  // wake at 6:30 AM EST = 10:30 UTC
  wake.setUTCHours(10, 30, 0, 0);
  if (now > wake) wake.setDate(wake.getDate() + 1);
  const diffMs = wake - now;
  const hrs = Math.floor(diffMs / (1000*60*60));
  const mins = Math.floor((diffMs % (1000*60*60)) / (1000*60));
  countdownEl.textContent = `Back in ${hrs}h ${mins}m`;
}

function updateStatusUI(status) {
  statusEl.textContent = status;
  // style class lowercased, no spaces
  statusEl.className = "status-label " + status.toLowerCase().replace(/\s+/g, "");
  if (status === "Sleeping") showCountdownForSleeping(); else countdownEl.textContent = "";
}

/* ---------- LISTEN / SYNC ---------- */
function listenForRemoteStatus() {
  if (!useFirebase) return;
  manualRef.on("value", mSnap => {
    manualOverride = !!mSnap.val();
    statusRef.once("value").then(sSnap => {
      const val = sSnap.val();
      if (manualOverride && val) {
        manualStatus = val;
        updateStatusUI(manualStatus);
      } else {
        updateStatusUI(computeAutoStatus());
      }
    }).catch(console.error);
  }, console.error);
}

/* ---------- WRITE REMOTE ---------- */
function setRemoteManualStatus(status) {
  if (useFirebase) {
    statusRef.set(status).catch(console.error);
    manualRef.set(true).catch(console.error);
  } else {
    // fallback: localStorage
    localStorage.setItem("manualOverride", "true");
    localStorage.setItem("manualStatus", status);
  }
}

/* ---------- CLEAR REMOTE ---------- */
function clearRemoteManual() {
  if (useFirebase) {
    manualRef.set(false).catch(console.error);
    statusRef.set("").catch(console.error);
  } else {
    localStorage.removeItem("manualOverride");
    localStorage.removeItem("manualStatus");
  }
}

/* ---------- LOAD PROJECTS (demo) ---------- */
function loadProjects() {
  const current = ["IFE system", "Grill UI", "Status Site"];
  const upcoming = ["Flight Tracker", "Live Check-in System"];
  current.forEach(p => {
    const li = document.createElement("li"); li.textContent = p; currentProjectsList.appendChild(li);
  });
  upcoming.forEach(p => {
    const li = document.createElement("li"); li.textContent = p; upcomingProjectsList.appendChild(li);
  });
}

/* ---------- MANUAL FLOW / PASSWORD ---------- */
enzoTitle.addEventListener("click", () => {
  // open password modal
  passwordInput.value = "";
  passwordModal.classList.remove("hidden");
});

if (passwordOk) {
  passwordOk.addEventListener("click", () => {
    const val = passwordInput.value || "";
    if (val === PASSWORD) {
      passwordModal.classList.add("hidden");
      manualPanel.classList.remove("hidden");
    } else {
      alert("Incorrect password.");
    }
  });
}

if (passwordCancel) passwordCancel.addEventListener("click", () => passwordModal.classList.add("hidden"));

// manual panel set
manualSet.addEventListener("click", () => {
  const sel = manualSelect.value;
  if (!sel) return;
  manualOverride = true;
  manualStatus = sel;
  updateStatusUI(manualStatus);
  setRemoteManualStatus(manualStatus);
  manualPanel.classList.add("hidden");
});

// manual reset
manualReset.addEventListener("click", () => {
  manualOverride = false;
  manualStatus = "";
  clearRemoteManual();
  updateStatusUI(computeAutoStatus());
  manualPanel.classList.add("hidden");
});

/* ---------- INITIALIZE / LOADER ---------- */
function startLoader() {
  // simple dots cycle handled via JS (reliable)
  loaderInterval = setInterval(() => {
    loaderDots = (loaderDots % 3) + 1;
    dotsSpan.textContent = ".".repeat(loaderDots);
  }, 500);
}

function stopLoaderAndShowMain() {
  clearInterval(loaderInterval);
  loader.style.opacity = "0";
  setTimeout(() => {
    loader.style.display = "none";
    // show main container
    document.getElementById("main").setAttribute("aria-hidden","false");
    document.body.classList.add("loaded");
    loadProjects();
    // start listening (firebase or local)
    if (useFirebase) listenForRemoteStatus();
    else {
      // local fallback: check localStorage for manual override
      if (localStorage.getItem("manualOverride") === "true") {
        const s = localStorage.getItem("manualStatus") || "Online";
        manualOverride = true;
        manualStatus = s;
        updateStatusUI(s);
      } else {
        updateStatusUI(computeAutoStatus());
      }
    }
    // update auto status every minute (only if not manual)
    setInterval(() => { if (!manualOverride) updateStatusUI(computeAutoStatus()); }, 60*1000);
  }, 600);
}

/* ---------- DOMContent load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  // start loader animation
  startLoader();
  // ensure main hidden initially
  document.getElementById("main").style.display = "block";
  document.getElementById("main").style.opacity = 0;

  // show main after X ms and fade
  setTimeout(() => {
    stopLoaderAndShowMain();
  }, 2500); // change loader time here if you want longer

});
