import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const ADMIN_UID =
  "hZghskrHnIZ5DYjSXwIM7FUjNjE3";
const db = getFirestore(app);


// ======================================================
// ELEMENTOS HTML
// ======================================================

const postsContainer = document.getElementById("posts-container");
const totalPosts = document.getElementById("total-posts");
const firebaseStatus = document.getElementById("firebase-status");

const newPostBtn = document.getElementById("new-post-btn");
const cancelPostBtn = document.getElementById("cancel-post-btn");

const postFormSection = document.getElementById("post-form-section");
const postForm = document.getElementById("post-form");

const formMessage = document.getElementById("form-message");

const formTitle = document.getElementById("form-title");
const submitBtn = postForm.querySelector(".publish-btn");


// ======================================================
// ESTADO DEL FORMULARIO
// ======================================================

// null = creando
// ID = editando
let editingPostId = null;


// ======================================================
// FUNCION PARA EVITAR HTML INYECTADO
// ======================================================

function escapeHtml(value = "") {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// ======================================================
// CARGAR POSTS
// ======================================================

async function loadPosts() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "posts")
    );


    postsContainer.innerHTML = "";

    totalPosts.textContent = querySnapshot.size;

    firebaseStatus.textContent = "Conectado";
    firebaseStatus.style.color = "#39b54a";


    if (querySnapshot.empty) {

      postsContainer.innerHTML = `
        <div class="loading">
          No hay publicaciones todavía.
        </div>
      `;

      return;
    }


    querySnapshot.forEach((docSnapshot) => {

      const post = docSnapshot.data();

      const postElement = document.createElement("article");

      postElement.className = "post-item";


      postElement.innerHTML = `

        <img
          src="${escapeHtml(
            post.image || "../assets/img/blog1.jpg"
          )}"
          alt="${escapeHtml(
            post.title || "Publicación"
          )}"
        >


        <div class="post-info">

          <h3>
            ${escapeHtml(
              post.title || "Sin título"
            )}
          </h3>

          <span>
            ${escapeHtml(
              post.category || "Sin categoría"
            )}
          </span>

        </div>


        <div class="post-actions">

          <button
            class="action-btn edit-btn"
            data-id="${docSnapshot.id}"
          >
            Editar
          </button>


          <button
            class="action-btn delete-btn"
            data-id="${docSnapshot.id}"
          >
            Eliminar
          </button>

        </div>

      `;


      postsContainer.appendChild(postElement);

    });


  } catch (error) {

    console.error(
      "Error al cargar publicaciones:",
      error
    );


    firebaseStatus.textContent = "Error";
    firebaseStatus.style.color = "#d33";


    postsContainer.innerHTML = `

      <div class="loading">
        No se pudieron cargar las publicaciones.
      </div>

    `;

  }

}


// ======================================================
// ABRIR FORMULARIO PARA CREAR
// ======================================================

newPostBtn.addEventListener("click", () => {

  editingPostId = null;


  formTitle.textContent = "Crear publicación";

  submitBtn.textContent = "Publicar artículo";


  postForm.reset();

  document.getElementById("author").value =
    "Equipo José Cuesta";


  formMessage.textContent = "";

  formMessage.className =
    "form-message";


  postFormSection.classList.remove("hidden");

  newPostBtn.style.display = "none";


  window.scrollTo({
    top: postFormSection.offsetTop - 20,
    behavior: "smooth"
  });

});


// ======================================================
// CANCELAR FORMULARIO
// ======================================================

cancelPostBtn.addEventListener("click", () => {

  editingPostId = null;

  postForm.reset();

  document.getElementById("author").value =
    "Equipo José Cuesta";


  formTitle.textContent =
    "Crear publicación";


  submitBtn.textContent =
    "Publicar artículo";


  formMessage.textContent = "";

  formMessage.className =
    "form-message";


  postFormSection.classList.add("hidden");

  newPostBtn.style.display =
    "inline-block";

});


// ======================================================
// EDITAR PUBLICACIÓN
// ======================================================

async function editPost(postId) {

  try {

    const postReference = doc(
      db,
      "posts",
      postId
    );


    const postSnapshot =
      await getDoc(postReference);


    if (!postSnapshot.exists()) {

      alert(
        "La publicación ya no existe."
      );

      await loadPosts();

      return;

    }


    const post = postSnapshot.data();


    // Guardamos el ID que estamos editando
    editingPostId = postId;


    // Cambiar título del formulario
    formTitle.textContent =
      "Editar publicación";


    // Cambiar botón
    submitBtn.textContent =
      "Guardar cambios";


    // Cargar valores
    document.getElementById("title").value =
      post.title || "";


    document.getElementById("category").value =
      post.category || "";


    document.getElementById("author").value =
      post.author || "Equipo José Cuesta";


    document.getElementById("image").value =
      post.image || "";


    document.getElementById("content").value =
      post.content || "";


    formMessage.textContent = "";

    formMessage.className =
      "form-message";


    // Mostrar formulario
    postFormSection.classList.remove(
      "hidden"
    );


    newPostBtn.style.display =
      "none";


    // Subir al formulario
    window.scrollTo({
      top: postFormSection.offsetTop - 20,
      behavior: "smooth"
    });


  } catch (error) {

    console.error(
      "Error al cargar publicación:",
      error
    );


    alert(
      "No se pudo cargar la publicación."
    );

  }

}


// ======================================================
// ELIMINAR PUBLICACIÓN
// ======================================================

async function deletePost(postId) {

  const confirmDelete = window.confirm(
    "¿Estás seguro de que deseas eliminar esta publicación?\n\nEsta acción no se puede deshacer."
  );


  if (!confirmDelete) {
    return;
  }


  try {

    const postReference = doc(
      db,
      "posts",
      postId
    );


    await deleteDoc(postReference);


    // Si estábamos editando esa publicación,
    // cerramos el formulario.
    if (editingPostId === postId) {

      editingPostId = null;

      postForm.reset();

      document.getElementById("author").value =
        "Equipo José Cuesta";


      formTitle.textContent =
        "Crear publicación";


      submitBtn.textContent =
        "Publicar artículo";


      postFormSection.classList.add(
        "hidden"
      );

      newPostBtn.style.display =
        "inline-block";

    }


    await loadPosts();


    alert(
      "✅ Publicación eliminada correctamente."
    );


  } catch (error) {

    console.error(
      "Error al eliminar publicación:",
      error
    );


    alert(
      "❌ No se pudo eliminar la publicación."
    );

  }

}


// ======================================================
// BOTONES EDITAR / ELIMINAR
// ======================================================

// Usamos delegación de eventos porque los botones
// se crean dinámicamente al cargar los posts.

postsContainer.addEventListener(
  "click",
  async (event) => {

    const button =
      event.target.closest(
        "button[data-id]"
      );


    if (!button) {
      return;
    }


    const postId =
      button.dataset.id;


    if (
      button.classList.contains(
        "edit-btn"
      )
    ) {

      await editPost(postId);

    }


    if (
      button.classList.contains(
        "delete-btn"
      )
    ) {

      button.disabled = true;

      await deletePost(postId);

      button.disabled = false;

    }

  }
);


// ======================================================
// CREAR / ACTUALIZAR POST
// ======================================================

postForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    // Obtener datos
    const title =
      document.getElementById("title")
        .value
        .trim();


    const category =
      document.getElementById("category")
        .value
        .trim();


    const author =
      document.getElementById("author")
        .value
        .trim();


    const image =
      document.getElementById("image")
        .value
        .trim();


    const content =
      document.getElementById("content")
        .value
        .trim();


    // Estado del botón
    submitBtn.disabled = true;


    formMessage.textContent =
      editingPostId
        ? "Guardando cambios..."
        : "Publicando...";


    formMessage.className =
      "form-message";


    try {

      // =================================================
      // EDITAR
      // =================================================

      if (editingPostId) {

        const postReference = doc(
          db,
          "posts",
          editingPostId
        );


        await updateDoc(
          postReference,
          {
            title: title,
            category: category,
            author: author,
            image: image,
            content: content
          }
        );


        formMessage.textContent =
          "✅ Cambios guardados correctamente.";


      }


      // =================================================
      // CREAR
      // =================================================

      else {

        await addDoc(
          collection(db, "posts"),
          {
            title: title,
            category: category,
            author: author,
            image: image,
            content: content,
            date: serverTimestamp()
          }
        );


        formMessage.textContent =
          "✅ Publicación creada correctamente.";

      }


      formMessage.className =
        "form-message success";


      // Actualizar listado
      await loadPosts();


      // Limpiar y volver a modo creación
      setTimeout(() => {

        editingPostId = null;

        postForm.reset();

        document.getElementById("author").value =
          "Equipo José Cuesta";


        formTitle.textContent =
          "Crear publicación";


        submitBtn.textContent =
          "Publicar artículo";


        formMessage.textContent = "";

        formMessage.className =
          "form-message";


        postFormSection.classList.add(
          "hidden"
        );


        newPostBtn.style.display =
          "inline-block";


      }, 1200);


    } catch (error) {

      console.error(
        "Error guardando publicación:",
        error
      );


      formMessage.textContent =
        "❌ No se pudo guardar la publicación. Revisa las reglas de Firebase.";


      formMessage.className =
        "form-message error";

    }


    submitBtn.disabled = false;

  }
);



// ======================================================
// PROTECCIÓN DEL PANEL
// ======================================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;
  }


  if (user.uid !== ADMIN_UID) {

    signOut(auth);

    window.location.href = "login.html";

    return;
  }
// ======================================================
// INICIAR PANEL
// ======================================================


  // Usuario autorizado
  loadPosts();

});


const logoutBtn =
  document.getElementById("logout-btn");


logoutBtn.addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

    }

  }
);