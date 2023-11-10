//import { onValue } from "@firebase/database";
import {initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, onChildAdded, ref, query, limitToLast } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js"; 

  // Import the functions you need from the SDKs you need


  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAvwcewC-_jeyFp00PjPWkHoer1C9FyoHM",
    authDomain: "diesel-generator-monitoring.firebaseapp.com",
    databaseURL: "https://diesel-generator-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "diesel-generator-monitoring",
    storageBucket: "diesel-generator-monitoring.appspot.com",
    messagingSenderId: "430810373156",
    appId: "1:430810373156:web:fc35706a1a351a89834cb1"
  };


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  //const reference = ref(db, '/readingRecords');
  const reference = query(ref(db, '/readingRecords'), limitToLast(2000));
  const liveRef = ref(db, '/generatorReadings');

  var tbl = document.getElementById("myTable");

  var allData = [];


  onChildAdded(reference, (snapshot) => {
    var obj = snapshot.val();
    var ts = obj.timestamp;
    var temp = obj.temperature;
    var rpm = obj.rpm;
    var harmo = obj.harmo;
    var ps = obj.powerStatus;
    var volt = obj.voltage;
    var curr = obj.current;
    allData.push({ts, temp, rpm, harmo, ps, volt, curr});

    
    var r = tbl.insertRow(1);
    var tsCell = r.insertCell();
    var tempCell = r.insertCell();
    var rpmCell = r.insertCell();
    var harmoCell = r.insertCell();
    var powerCell = r.insertCell();
    var voltCell = r.insertCell();
    var currCell = r.insertCell();

    tsCell.innerHTML = new Date(ts * 1000).toLocaleString([], { month: "long", day: "2-digit", year:"numeric", hour: "2-digit", minute: "2-digit" });
    tempCell.innerHTML = temp;
    rpmCell.innerHTML = rpm;
    harmoCell.innerHTML = harmo;
    powerCell.innerHTML = ps < 1 ? "OFF" : "ON";
    voltCell.innerHTML = volt;
    currCell.innerHTML = curr;
  });

