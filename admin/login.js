
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// ======================================================
// CONFIGURACIÓN DE FIREBASE
// ======================================================

const firebaseConfig = {

  apiKey: "AIzaSyCRTKpuegv9jYwafwO_zSYjLRfPDB9Lgm4",

  authDomain: "jose-cuesta-web.firebaseapp.com",

  projectId: "jose-cuesta-web",

  storageBucket: "jose-cuesta-web.firebasestorage.app",

  messagingSenderId: "503821106238",

  appId: "1:503821106238:web:5a04ad771732b75e93656f",

  measurementId: "G-86WV69YPDR"

};


// ======================================================
// DATOS DEL ADMINISTRADOR
// ======================================================

// Usuario que verá la persona en el formulario.
const ADMIN_USERNAME = "admin";


// Correo utilizado internamente por Firebase.
const ADMIN_EMAIL = "bogotaredc@gmail.com";


// UID autorizado.
const ADMIN_UID =
  "hZghskrHnIZ5DYjSXwIM7FUjNjE3";


// ======================================================
// INICIALIZAR FIREBASE
// ======================================================

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);


// ======================================================
// ELEMENTOS HTML
// ======================================================

const loginForm =
  document.getElementById("login-form");

const loginMessage =
  document.getElementById("login-message");

const loginBtn =
  document.getElementById("login-btn");


// ======================================================
// COMPROBAR SESIÓN EXISTENTE
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    return;
  }


  // El usuario está autenticado,
  // pero no tiene el UID autorizado.

  if (user.uid !== ADMIN_UID) {

    await signOut(auth);

    loginMessage.textContent =
      "Este usuario no tiene permisos de administrador.";

    loginMessage.className =
      "form-message error";

    return;
  }


  // Usuario autorizado.

  window.location.href =
    "admin.html";

});


// ======================================================
// LOGIN
// ======================================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // ================================================
    // OBTENER CREDENCIALES
    // ================================================

    const username =
      document
        .getElementById("username")
        .value
        .trim()
        .toLowerCase();


    const password =
      document
        .getElementById("password")
        .value;


    // ================================================
    // COMPROBAR USUARIO VISIBLE
    // ================================================

    if (username !== ADMIN_USERNAME) {

      loginMessage.textContent =
        "❌ Usuario o contraseña incorrectos.";

      loginMessage.className =
        "form-message error";

      return;
    }


    loginBtn.disabled = true;

    loginBtn.textContent =
      "Ingresando...";


    loginMessage.textContent =
      "Comprobando acceso...";

    loginMessage.className =
      "form-message";


    try {

      // ================================================
      // AUTENTICACIÓN FIREBASE
      // ================================================

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          ADMIN_EMAIL,
          password
        );


      const user =
        userCredential.user;


      // ================================================
      // VERIFICAR UID
      // ================================================

      if (user.uid !== ADMIN_UID) {

        await signOut(auth);

        throw new Error(
          "Usuario sin permisos de administrador."
        );

      }


      // ================================================
      // LOGIN CORRECTO
      // ================================================

      loginMessage.textContent =
        "✅ Acceso autorizado.";

      loginMessage.className =
        "form-message success";


      window.location.href =
        "admin.html";


    } catch (error) {

      console.error(
        "Error de autenticación:",
        error
      );


      console.error(
        "Código Firebase:",
        error.code
      );


      console.error(
        "Mensaje:",
        error.message
      );


      loginMessage.textContent =
        "❌ Usuario o contraseña incorrectos.";

      loginMessage.className =
        "form-message error";

    }


    loginBtn.disabled = false;

    loginBtn.textContent =
      "Iniciar sesión";

  }
);

