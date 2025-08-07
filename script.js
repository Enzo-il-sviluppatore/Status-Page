// Firebase init
const firebaseConfig = { /* YOUR CONFIG HERE */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const statusRef = db.ref('status');
const manualRef = db.ref('manualOverride');

const loader = document.getElementById('loader');
const main = document.getElementById('mainContent');
const statusText = document.getElementById('statusText');
const countdown = document.getElementById('countdown');
const currentList = document.getElementById('currentProjects');
const upcomingList = document.getElementById('upcomingProjects');
const modal = document.getElementById('passwordModal');
const enzoLink = document.getElementById('enzo-status-text');

window.onload = () => {
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
      document.body.classList.add('loaded');
      listenStatus();
      loadProjects();
    }, 800);
  }, 2000);
};

function listenStatus() {
  manualRef.on('value', snap => {
    if (snap.val()) {
      statusRef.once('value').then(s => updateStatus(s.val()));
    } else {
      autoStatus();
    }
  });
}

function autoStatus() {
  const h = (new Date().getUTCHours()-4+24)%24;
  const d = new Date().getDay();
  let st = 'Online';
  if (h>=22||h<6) st='Sleeping';
  else if (h>=7&&h<14&&d>=1&&d<=5) st='At School';
  else if (h>=14&&h<15) st='On Break';
  updateStatus(st);
}

function updateStatus(st) {
  statusText.textContent = st;
  countdown.textContent = st==='Sleeping'? 
    `Back in ${Math.floor(((new Date().setUTCHours(10,30,0)-Date.now())/(3600000))) || 0}h` : '';
}

enzoLink.onclick = () => { modal.style.display = 'flex' };
document.getElementById('passwordSubmit').onclick = () => {
  if (document.getElementById('passwordInput').value === 'yourPassword'){
    manualRef.set(true);
    statusRef.set(document.getElementById('statusSelector')?.value || 'Online');
    modal.style.display = 'none';
  } else alert('bad pass');
};
document.getElementById('passwordCancel').onclick = () => modal.style.display = 'none';

document.getElementById('statusSelector')?.onchange = () => {
  statusRef.set(document.getElementById('statusSelector').value);
  manualRef.set(true);
};

function loadProjects() {
  ['IFE', 'Status Site', 'Grill UI'].forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    currentList.appendChild(li);
  });
  ['Flight Tracker','Check-In System'].forEach(p => {
    const li = document.createElement('li');
    li.textContent = p;
    upcomingList.appendChild(li);
  });
}
