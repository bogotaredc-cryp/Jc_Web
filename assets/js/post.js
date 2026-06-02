import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "jose-cuesta-web",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Obtener ID desde URL
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

// 📌 Validación
if (!postId) {
  document.getElementById("post-title").textContent = "ID no válido";
  throw new Error("No hay ID en la URL");
}

// 📌 Referencia
const docRef = doc(db, "posts", postId);

// 📌 Formatear fecha
function formatearFecha(dateField) {
  if (!dateField) return "Fecha no disponible";

  try {
    if (typeof dateField.toDate === "function") {
      return dateField.toDate().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }

    return new Date(dateField).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  } catch (e) {
    console.error("Error fecha:", e);
    return "Fecha inválida";
  }
}

// 🔥 FORMATEAR CONTENIDO (tipo blog pro)
function formatearContenido(texto) {
  if (!texto) return "<p>Sin contenido disponible</p>";

  const bloques = texto.split("\n\n");

  return bloques.map(bloque => {
    bloque = bloque.trim();

    if (bloque.startsWith("## ")) {
      return `<h2>${bloque.replace("## ", "")}</h2>`;
    }

    if (bloque.startsWith("### ")) {
      return `<h3>${bloque.replace("### ", "")}</h3>`;
    }

    if (bloque.includes("\n- ")) {
      const items = bloque.split("\n").map(item =>
        `<li>${item.replace("- ", "")}</li>`
      ).join("");

      return `<ul>${items}</ul>`;
    }

    return `<p>${bloque}</p>`;
  }).join("");
}

// 📌 Cargar post
async function loadPost() {
  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const post = docSnap.data();
      const fecha = formatearFecha(post.date);
      document.getElementById("post-author").textContent =
        post.author || "José Cuesta Novoa";
      // 🔹 HERO
      document.getElementById("post-title").textContent =
        post.title || "Sin título";

      document.getElementById("post-category").textContent =
        post.category || "General";

      document.getElementById("post-date").textContent =
        fecha;

      // 🔹 HERO BACKGROUND DINÁMICO
      const hero = document.querySelector(".post-hero");
      hero.style.backgroundImage = `
        linear-gradient(rgba(20,61,42,0.75), rgba(20,61,42,0.65)),
        url(${post.image || "../assets/img/default.jpg"})
      `;

      // 🔹 CONTENIDO
      document.getElementById("post-body-content").innerHTML =
        formatearContenido(post.content);

    } else {
      document.getElementById("post-title").textContent =
        "Publicación no encontrada";
    }

  } catch (error) {
    console.error("Error:", error);

    document.getElementById("post-title").textContent =
      "Error cargando publicación";
  }
}

loadPost();