import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLHfG-ItovNunNXqbto01dFdbv23z5Rvo",
  authDomain: "caches-im-wandel-logbuch.firebaseapp.com",
  databaseURL: "https://caches-im-wandel-logbuch-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "caches-im-wandel-logbuch",
  storageBucket: "caches-im-wandel-logbuch.firebasestorage.app",
  messagingSenderId: "357410707275",
  appId: "1:357410707275:web:184f070275707f686b3ace"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const entriesRef = ref(db, "logbuch");

const correctPIN = "?4711";
const targetLat = 48.7456091;
const targetLng = 8.0474770;
const radiusMeters = 50;

window.checkPin = function() {
  const pin = document.getElementById("pin").value;
  if (pin === correctPIN) {
    document.getElementById("pinForm").style.display = "none";
    document.getElementById("logForm").style.display = "block";
    document.getElementById("logbuch").style.display = "block";
    loadEntries();
    checkLocation();
  } else {
    alert("Falscher PIN!");
  }
};

window.submitName = function() {
  const name = document.getElementById("name").value.trim();
  if (!name) return;

  push(entriesRef, { name: name, timestamp: Date.now() });
  document.getElementById("name").value = "";
};

function loadEntries() {
  onValue(entriesRef, snapshot => {
    const data = snapshot.val();
    const entriesList = document.getElementById("entries");
    entriesList.innerHTML = "";

    if (data) {
      const items = Object.values(data);
      items.sort((a, b) => a.timestamp - b.timestamp);

      items.forEach((entry, idx) => {
        const li = document.createElement("li");
        const date = new Date(entry.timestamp).toLocaleString();
        li.textContent = "#" + (idx + 1) + " – " + entry.name + " (" + date + ")";
        entriesList.appendChild(li);
      });
    }
  });
}

function checkLocation() {
  const status = document.getElementById("locationStatus");
  const button = document.getElementById("submitBtn");

  if (!navigator.geolocation) {
    status.textContent = "GPS wird nicht unterstützt.";
    return;
  }

  status.textContent = "Standort wird geprüft...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const dist = getDistance(lat, lng, targetLat, targetLng);
      if (dist <= radiusMeters) {
        button.disabled = false;
        status.textContent = "Standort erkannt – du kannst dich eintragen.";
      } else {
        status.textContent = "Du bist zu weit vom Ziel entfernt.";
      }
    },
    () => {
      status.textContent = "Standort konnte nicht ermittelt werden.";
    }
  );
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dphi = (lat2 - lat1) * Math.PI / 180;
  const dlambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dphi/2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
