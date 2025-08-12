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
const statusRef = db.ref("status");
const manualRef = db.ref("manualOverride");

let manualOverride = false;
let manualStatus = "";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const dots = document.getElementById("dots");
  const main = document.getElementById("main");
  const enzoTitle = document.getElementById("enzo-status-text");
  const statusEl = document.getElementById("status");
  const countdownEl = document.getElementById("countdown");
  const passwordModal = document.getElementById("password-modal");
  const passwordInput = document.getElementById("password-input");
  const passwordOk = document.getElementById("password-ok");
  const passwordCancel = document.getElementById("password-cancel");
  const manualPanel = document.getElementById("manual-panel");
  const manualSelect = document.getElementById("manual-select");
  const manualSet = document.getElementById("manual-set");
  const manualReset = document.getElementById("manual-reset");
  const currList = document.getElementById("current-projects");
  const upList = document.getElementById("upcoming-projects");

  const PASSWORD = "VBal55001"; 

  let dotCount = 1;
  const dotInterval = setInterval(() => {
    dotCount = (dotCount % 3) + 1;
    dots.textContent = ".".repeat(dotCount);
  }, 500);

  ["IFE system (Roblox)","Maura Training Center (Roblox)","Manifest Event Center (Roblox)","AiChai Cafe Training Center (Roblox)","Bar de Milano Ordering and Payment System (real life/non Roblox)"].forEach(p => { const li=document.createElement("li");li.textContent=p;currList.appendChild(li);});
  ["Leonardo Campo Gioielli AI Customer Support/Booking (real life/non Roblox)","Confidential (real life/non Roblox)"].forEach(p => { const li=document.createElement("li");li.textContent=p;upList.appendChild(li);});

  setTimeout(() => {
    clearInterval(dotInterval);
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      main.classList.remove("hidden");
      document.querySelectorAll(".panel, .footer").forEach(el => el.classList.remove("hidden"));
      startStatusSystem();
    }, 600);
  }, 5000);

  [enzoTitle, statusEl].forEach(el => el.addEventListener("click", () => {
    passwordInput.value = "";
    passwordModal.classList.remove("hidden");
    passwordInput.focus();
  }));

  passwordOk.addEventListener("click", () => {
    if (passwordInput.value === PASSWORD) {
      passwordModal.classList.add("hidden");
      manualPanel.classList.remove("hidden");
    } else {
      alert("Incorrect password.");
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
  passwordCancel.addEventListener("click", () => passwordModal.classList.add("hidden"));

  manualSet.addEventListener("click", () => {
    const s = manualSelect.value;
    if (!s) return;
    statusRef.set(s).catch(console.error);
    manualRef.set(true).catch(console.error);
    manualPanel.classList.add("hidden");
  });

  manualReset.addEventListener("click", () => {
    manualRef.set(false).catch(console.error);
    manualPanel.classList.add("hidden");
  });

  const schedule = [
    { time: "06:25", status: "Online" },   
    { time: "07:40", status: "At School" },
    { time: "15:50", status: "Sports" },
    { time: "18:00", status: "Offline" },
    { time: "19:30", status: "Online" },
    { time: "21:00", status: "Sleeping" }
  ];


  function getESTNow() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  }

  function computeAutoStatus() {
    const now = getESTNow();
    const cur = now.getHours()*60 + now.getMinutes();
    let last = schedule[0].status;
    for (let i=0;i<schedule.length;i++){
      const [h,m] = schedule[i].time.split(":").map(Number);
      const mins = h*60 + m;
      if (cur >= mins) last = schedule[i].status;
    }
    return last;
  }

  function computeNextChange() {
    const now = getESTNow();
    for (let i=0;i<schedule.length;i++){
      const [h,m] = schedule[i].time.split(":").map(Number);
      const t = new Date(now);
      t.setHours(h, m, 0, 0);
      if (t > now) return t;
    }
  
    const [h,m] = schedule[0].time.split(":").map(Number);
    const t = new Date(now);
    t.setDate(t.getDate()+1);
    t.setHours(h,m,0,0);
    return t;
  }

  function startCountdownLoop() {
    setInterval(() => {
      let next = computeNextChange();
      const diff = Math.max(0, Math.floor((next - getESTNow())/1000));
      const hrs = Math.floor(diff/3600);
      const mins = Math.floor((diff%3600)/60);
      const secs = diff%60;
      countdownEl.textContent = `Next change in ${hrs}hrs ${mins}mins ${secs}secs`;
    }, 1000);
  }


  function startStatusSystem() {

    manualRef.on("value", mSnap => {
      manualOverride = !!mSnap.val();

      if (manualOverride) {
        statusRef.once("value").then(sSnap => {
          manualStatus = sSnap.val() || computeAutoStatus();
          statusEl.textContent = manualStatus;
          statusEl.className = "status-label " + manualStatus.toLowerCase().replace(/\s+/g,"");
        }).catch(console.error);
      } else {

        const auto = computeAutoStatus();
        statusRef.set(auto).catch(console.error);
        statusEl.textContent = auto;
        statusEl.className = "status-label " + auto.toLowerCase().replace(/\s+/g,"");
      }
    }, console.error);

    statusRef.on("value", sSnap => {
      const val = sSnap.val();
      if (val) {
        statusEl.textContent = val;
        statusEl.className = "status-label " + val.toLowerCase().replace(/\s+/g,"");
      }
    }, console.error);


    startCountdownLoop();
  }
});
