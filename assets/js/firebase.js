
// ==========================================
// CONFIGURACIÓN FIREBASE
// Jose Cuesta Novoa
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔥 CONFIGURACIÓN DEL PROYECTO

const firebaseConfig = {

    apiKey: "AIzaSyCRTKpuegv9jYwafwO_zSYjLRfPDB9Lgm4",

    authDomain: "jose-cuesta-web.firebaseapp.com",

    projectId: "jose-cuesta-web",

    storageBucket: "jose-cuesta-web.firebasestorage.app",

    messagingSenderId: "503821106238",

    appId: "1:503821106238:web:5a04ad771732b75e93656f",

    measurementId: "G-86WV69YPDR"

};


// Inicializar Firebase

const app = initializeApp(firebaseConfig);


// Inicializar Firestore

const db = getFirestore(app);


// Exportar Firestore

export {
    db
};

