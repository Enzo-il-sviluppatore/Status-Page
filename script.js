function getStatus() {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const estOffset = -4; // EDT (Eastern Daylight Time)

  const estHour = (hour + estOffset + 24) % 24;

  const statusElement = document.getElementById("status");
  const countdownElement = document.getElementById("countdown");

  let status = "Online";
  let className = "online";
  let backIn = "";

  if (estHour >= 22 || estHour < 6) {
    status = "Sleeping";
    className = "sleeping";

    const wakeUpHour = 6.5; // 6:30 AM EST
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

  statusElement.textContent = status;
  statusElement.className = "status " + className;
  countdownElement.textContent = backIn;

  // Show page content and hide loader
  const loader = document.getElementById("loader");
  const container = document.querySelector(".container");

  setTimeout(() => {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      container.style.display = "block";
    }, 800); // match transition time
  }, 1000); // slight delay for vibe
}

setTimeout(getStatus, 1200); // Give loader a sec
setInterval(getStatus, 60000); // Update every minute

