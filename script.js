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

// Loader animation
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
    document.querySelectorAll('.container, footer, header, main').forEach(el => {
      el.classList.remove('hidden');
    });
    document.getElementById('projects-section').classList.remove('hidden'); // Show projects
  }, 800);
}, 2000);

// Elements
const statusText = document.getElementById('status');
const manualStatusDiv = document.getElementById('manual-status');
const enzoStatusText = document.getElementById('enzo-status-text');
const passwordPopup = document.getElementById('password-popup');
const passwordInput = document.getElementById('password-input');

// Password system
const PASSWORD = "test123";

// Trigger password popup from both heading and status text
[enzoStatusText, statusText].forEach(el => {
  el.addEventListener('click', () => {
    passwordPopup.classList.remove('hidden');
    passwordPopup.style.zIndex = "99999";
  });
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

// Auto status updates
db.ref('status').on('value', snapshot => {
  const val = snapshot.val();
  if (val) {
    statusText.textContent = val;
    statusText.className = `status ${val.toLowerCase().replace(/ /g, '')}`;
  }
});

// Countdown logic (hrs mins secs)
function updateCountdown(targetTime) {
  const now = new Date();
  let diff = Math.floor((targetTime - now) / 1000);
  if (diff < 0) diff = 0;

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  document.getElementById('countdown').textContent =
    `Next change in ${hours}hrs ${minutes}mins ${seconds}secs`;
}

// Example auto-change schedule (EST)
const schedule = [
  { time: "08:00", status: "Online" },
  { time: "12:00", status: "School" },
  { time: "16:00", status: "Break" },
  { time: "22:00", status: "Sleeping" }
];

function checkSchedule() {
  const now = new Date();
  now.setSeconds(0, 0);

  let nextChange = null;

  for (let i = 0; i < schedule.length; i++) {
    const [hours, minutes] = schedule[i].time.split(":").map(Number);
    const changeTime = new Date(now);
    changeTime.setHours(hours, minutes, 0, 0);

    if (now < changeTime) {
      nextChange = changeTime;
      break;
    }
  }

  if (!nextChange) {
    const [hours, minutes] = schedule[0].time.split(":").map(Number);
    nextChange = new Date(now);
    nextChange.setDate(nextChange.getDate() + 1);
    nextChange.setHours(hours, minutes, 0, 0);
  }

  updateCountdown(nextChange);
}

setInterval(checkSchedule, 1000);

// Manual status
document.getElementById('set-status-btn').addEventListener('click', () => {
  const newStatus = document.getElementById('status-select').value;
  if (newStatus) {
    db.ref('status').set(newStatus);
  }
});
document.getElementById('reset-status-btn').addEventListener('click', () => {
  manualStatusDiv.classList.add('hidden');
});
