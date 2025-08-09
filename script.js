// ===== Firebase Config =====
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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===== Loader Animation =====
const loader = document.getElementById('loader');
const dots = document.getElementById('dots');
let dotCount = 1;
setInterval(() => {
  dotCount = (dotCount % 3) + 1;
  dots.textContent = '.'.repeat(dotCount);
}, 500);

// Show content after load
setTimeout(() => {
  loader.style.opacity = '0';
  setTimeout(() => {
    loader.classList.add('hidden');
    document.querySelector('.container').classList.remove('hidden');
  }, 800);
}, 2000);

// ===== Elements =====
const statusText = document.getElementById('status');
const enzoStatusText = document.getElementById('enzo-status-text');
const countdownEl = document.getElementById('countdown');
const manualStatusDiv = document.getElementById('manual-status');
const passwordPopup = document.getElementById('password-popup');
const passwordInput = document.getElementById('password-input');

// ===== Password System =====
const PASSWORD = "test123";
enzoStatusText.addEventListener('click', () => {
  passwordPopup.classList.remove('hidden');
});
document.getElementById('password-submit').addEventListener('click', () => {
  if (passwordInput.value === PASSWORD) {
    passwordPopup.classList.add('hidden');
    manualStatusDiv.classList.remove('hidden');
  } else {
    alert('Wrong password!');
  }
});
document.getElementById('password-cancel').addEventListener('click', () => {
  passwordPopup.classList.add('hidden');
});

// ===== Schedule (in EST) =====
const schedule = [
  { time: "06:00", status: "Online" },
  { time: "08:00", status: "School" },
  { time: "15:00", status: "Break" },
  { time: "16:00", status: "Online" },
  { time: "23:00", status: "Sleeping" }
];

// ===== Auto Status Logic =====
function getCurrentESTDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}

function updateStatusFromSchedule() {
  const now = getCurrentESTDate();
  const currentTimeStr = now.toTimeString().slice(0,5);

  let currentStatus = schedule[0].status;
  for (let i = 0; i < schedule.length; i++) {
    if (currentTimeStr >= schedule[i].time) {
      currentStatus = schedule[i].status;
    }
  }

  db.ref('status').set(currentStatus);
  updateCountdown();
}

function updateCountdown() {
  const now = getCurrentESTDate();
  let nextChange = null;

  for (let i = 0; i < schedule.length; i++) {
    const [h, m] = schedule[i].time.split(":").map(Number);
    const changeTime = new Date(now);
    changeTime.setHours(h, m, 0, 0);
    if (changeTime > now) {
      nextChange = changeTime;
      break;
    }
  }
  if (!nextChange) {
    // Next change is tomorrow
    const [h, m] = schedule[0].time.split(":").map(Number);
    nextChange = new Date(now);
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(h, m, 0, 0);
  }

  const diffMs = nextChange - now;
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);

  countdownEl.textContent = `Next change in ${mins}m ${secs}s`;
}

// Update status & countdown every minute
setInterval(updateStatusFromSchedule, 60000);
setInterval(updateCountdown, 1000);
updateStatusFromSchedule();

// ===== Listen for Changes =====
db.ref('status').on('value', snapshot => {
  const val = snapshot.val();
  if (val) {
    statusText.textContent = val;
    statusText.className = `status ${val.toLowerCase().replace(/ /g, '')}`;
  }
});

// ===== Manual Status Change =====
document.getElementById('set-status-btn').addEventListener('click', () => {
  const newStatus = document.getElementById('status-select').value;
  if (newStatus) {
    db.ref('status').set(newStatus);
  }
});
document.getElementById('reset-status-btn').addEventListener('click', () => {
  manualStatusDiv.classList.add('hidden');
});
