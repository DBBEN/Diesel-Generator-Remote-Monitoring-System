//import { onValue } from "@firebase/database";
import {initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { onValue, getDatabase, onChildAdded, ref, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js"; 

let tempReading = document.querySelector(".temp-data");
let rpmReading = document.querySelector(".rpm-data");
let harmoReading = document.querySelector(".harmo-data");
let powerReading = document.querySelector(".ps-data");
let voltReading = document.querySelector(".volt-data");
let currReading = document.querySelector(".curr-data");

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
  const reference = query(ref(db, '/readingRecords'), limitToLast(20));
  const liveRef = ref(db, '/generatorReadings');

  var table = document.createElement("table");
  var container = document.getElementById("table-container");
  

  var chart1Data;
  var chart2Data;
  var chart3Data;
  var chart4Data;
  var chart5Data;
  var chart6Data;
  var chart1;
  var chart2;
  var chart3;
  var chart4;
  var chart5;
  var chart6;

  var tempData = [];
  var rpmData = [];
  var harmoData = [];
  var powerData = [];
  var voltData = [];
  var currData = [];
  var allData = [];

  var timer = false;
  

  onChildAdded(reference, (snapshot) => {
    var obj = snapshot.val();
    var ts = obj.timestamp;
    var temp = obj.temperature;
    var rpm = obj.rpm;
    var harmo = obj.harmo;
    var ps = obj.powerStatus;
    var volt = obj.voltage;
    var curr = obj.current;

    tempData.push({ x: ts, y: temp });
    rpmData.push({ x: ts, y: rpm });
    harmoData.push({ x: ts, y: harmo });
    powerData.push({ x: ts, y: ps });
    voltData.push({ x: ts, y: volt });
    currData.push({ x: ts, y: curr });
    allData.push({ts, temp, rpm, harmo, ps, volt, curr});

    if(tempData.length > 20){
      tempData.splice(0,1);
      rpmData.splice(0,1);
      harmoData.splice(0,1);
      powerData.splice(0,1);
      voltData.splice(0,1);
      currData.splice(0,1);
    }
        
    chart1Data = {
      series: [{
          name: 'Temperature',
          data: tempData
        }
      ]
    };

    chart2Data = {
      series: [{
          name: 'RPM',
          data: rpmData
        }
      ]
    };

    chart3Data = {
      series: [{
          name: 'Harmonics',
          data: harmoData
        }
      ]
    };

    chart4Data = {
      series: [{
          name: 'Power',
          data: powerData
        }
      ]
    };

    chart5Data = {
      series: [{
          name: 'Voltage',
          data: voltData
        }
      ]
    };

    chart6Data = {
      series: [{
          name: 'Current',
          data: currData
        }
      ]
    };

    chart1.update(chart1Data);
    chart2.update(chart2Data);
    chart3.update(chart3Data);
    chart4.update(chart4Data);
    chart5.update(chart5Data);
    chart6.update(chart6Data);

  });

  onValue(liveRef, (snapshot) => {
    var liveSnap = snapshot.val();
    tempReading.textContent = `${liveSnap.temperature}°C`;
    rpmReading.textContent = `${liveSnap.rpm} RPM`;
    harmoReading.textContent = `${liveSnap.harmo} Hz`;
    voltReading.textContent = `${liveSnap.voltage} V`;
    currReading.textContent = `${liveSnap.current} A`;
    if(liveSnap.powerStatus < 1) powerReading.textContent = `OFF`;
    else powerReading.textContent = `ON`;

    if(liveSnap.temperature > 90) alert("Temperature is above limit");
    if(liveSnap.harmo > 3000) alert("Harmonic reading is above limit");

    if(liveSnap.rpm >= 1800) stopwatchClass.start();
    else if (liveSnap.rpm < 1800) stopwatchClass.stop();
  });

 
  setTimeout(function() {
    chart1 = new Chartist.Line(
      ".amp-pxl",
      {
        series: [{
          name: 'Temperature',
          data: tempData
        }]
      },
      {
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {
          // On the y-axis start means left and end means right
          high: 200,
          low: 0,
          labelInterpolationFnc: function (value) {
            return Math.round(value).toString() + '°C';
          }
          
        },
        fullWidth: true,
        showPoint: false,
        //plugins: [Chartist.plugins.tooltip()]
      },
    );
  
    chart2 = new Chartist.Line(
      ".amp-pxl2",
      {
        series: [
          {
            name: 'RPM',
            data: rpmData
          }
        ]
      },
      {
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {
          // On the y-axis start means left and end means right
          //high: 10000,
          //low: 0,
          labelInterpolationFnc: function (value) {
            return Math.round(value);
          }
          
        },
        showPoint: false,
        //plugins: [Chartist.plugins.tooltip()]
        
      }
    );
  
    chart3 = new Chartist.Line(
      ".amp-pxl3",
      {
        series: [
          {
            name: 'Harmonics',
            data: harmoData
          }
        ]
      },
      {
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {
          // On the y-axis start means left and end means right
          labelInterpolationFnc: function (value) {
            return Math.round(value);
          }
          
        },
        showPoint: false,
        //plugins: [Chartist.plugins.tooltip()]
      }
    );
  
    chart4 = new Chartist.Line(
      ".amp-pxl4",
      {
        series: [
          {
            name: 'Power',
            data: powerData
          }
        ]
      },
      {
        //seriesBarDistance: 10,
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {  
          type: Chartist.FixedScaleAxis,
          // On the y-axis start means left and end means right
          labelInterpolationFnc: function (value) {
            if(value > 0) return 'ON';
            else return 'OFF';
          }
          
        },
        showPoint: false,
        lineSmooth: Chartist.Interpolation.step(),
        //plugins: [Chartist.plugins.tooltip()]
      }
    );

    chart5 = new Chartist.Line(
      ".amp-pxl5",
      {
        series: [{
          name: 'Voltage',
          data: voltData
        }]
      },
      {
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {
          // On the y-axis start means left and end means right
          high: 250,
          low: 0,
          labelInterpolationFnc: function (value) {
            return Math.round(value).toString() + 'V';
          }
          
        },
        fullWidth: true,
        showPoint: false,
        //plugins: [Chartist.plugins.tooltip()]
      },
    );

    chart6 = new Chartist.Line(
      ".amp-pxl6",
      {
        series: [{
          name: 'Current',
          data: currData
        }]
      },
      {
        axisX: {
          // On the x-axis start means top and end means bottom
          type: Chartist.FixedScaleAxis,
          divisor: 6,
          labelInterpolationFnc: function(value) {
            return new Date(value * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          },
  
          showGrid: false,
        },
        axisY: {
          // On the y-axis start means left and end means right
          high: 1,
          low: 0,
          labelInterpolationFnc: function (value) {
            return Math.round(value).toString() + 'A';
          }
          
        },
        fullWidth: true,
        showPoint: false,
        //plugins: [Chartist.plugins.tooltip()]
      },
    );

  }, 50);

  class Stopwatch {
    constructor() {
      this.startTime = null;
      this.timerId = null;
      this.elapsedTime = 0;
    }
  
    start() {
      if (this.timerId === null) {
        this.startTime = new Date().getTime();
        this.timerId = setInterval(() => {
          const currentTime = new Date().getTime();
          this.elapsedTime = currentTime - this.startTime;
          this.updateDisplay();
        }, 1000);
      }
    }
  
    stop() {
      if (this.timerId !== null) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }
  
    reset() {
      this.startTime = null;
      this.elapsedTime = 0;
      this.updateDisplay();
    }
  
    updateDisplay() {
      const totalSeconds = Math.floor(this.elapsedTime / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
  
      const hourString = String(hours).padStart(2, '0');
      const minuteString = String(minutes).padStart(2, '0');
      const secondString = String(seconds).padStart(2, '0');
  
      document.getElementById('hrs').innerHTML = hourString;
      document.getElementById('mins').innerHTML = minuteString;
      document.getElementById('secs').innerHTML = secondString;
    }
  }

  const stopwatchClass = new Stopwatch();
  
  
