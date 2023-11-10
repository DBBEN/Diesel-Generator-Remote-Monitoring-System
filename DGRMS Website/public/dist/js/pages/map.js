// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getDatabase, onValue, ref } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMONX2MdE8Il11d_Ee00E4kpuYxsAwfeQ",
    authDomain: "smart-gbin.firebaseapp.com",
    databaseURL: "https://smart-gbin-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-gbin",
    storageBucket: "smart-gbin.appspot.com",
    messagingSenderId: "767454820018",
    appId: "1:767454820018:web:a79e7238252dbaeb543bab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const reference = ref(db, '/gbin-1/gps');
onValue(reference, (snapshot) => {
    const data = JSON.stringify(snapshot.val());
    console.log(data);
    var obj = JSON.parse(data);
    var lat = obj.gpsLat;
    var long = obj.gpsLong;

    if(lat > 0 && long > 0){
        let marker = new L.Marker([lat, long]);
        marker.addTo(map);
    }
})


var map = L.map('map').setView([7.44653, 125.80113], 19);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
// map.addLayer(layer);

// let marker = new L.Marker([51.958, 9.141]);
// marker.addTo(map);