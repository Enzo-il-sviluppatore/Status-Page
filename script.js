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
    document.querySelector('.container').classList.remove('hidden');
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

// Auto status updates
db.ref('status').on('value', snapshot => {
  const val = snapshot.val();
  if (val) {
    statusText.textContent = val;
    statusText.className = `status ${val.toLowerCase().replace(/ /g, '')}`;
  }
});

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
