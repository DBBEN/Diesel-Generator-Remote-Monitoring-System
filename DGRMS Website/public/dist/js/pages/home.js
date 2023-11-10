// Import the functions you need from the SDKs you need
import {initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
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
const reference = ref(db, 'global/');
onValue(reference, (snapshot) => {
    const data = snapshot.val();
    console.log(data);
})
