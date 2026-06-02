import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 TU CONFIG (desde Firebase console)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "jose-cuesta-web",
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Contenedor
const container = document.getElementById("blog-container");
function resumirTexto(texto, limite = 120) {
  if (!texto) return "";

  if (texto.length <= limite) return texto;

  return texto.substring(0, limite) + "...";
}
// Obtener posts
async function loadPosts() {
  const querySnapshot = await getDocs(collection(db, "posts"));

  container.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const card = `
      <article class="blog-card">
        <img src="${post.image}" alt="${post.title}">
        <div class="blog-content">
          <span class="blog-tag">${post.category}</span>
          <h3>${post.title}</h3>
          <p>${resumirTexto(post.content, 140)}</p>
          <a href="post.html?id=${doc.id}" class="read-more">
            Leer más →
          </a>
        </div>
      </article>
    `;


    container.innerHTML += card;
  });
}

loadPosts();