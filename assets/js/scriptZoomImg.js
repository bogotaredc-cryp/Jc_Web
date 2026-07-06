const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalInfo = document.querySelector(".modal-info");
const closeBtn = document.querySelector(".close");

// Abrir modal
document.querySelectorAll(".card img").forEach(img => {
  img.addEventListener("click", () => {

    modal.style.display = "flex";

    modalTitle.textContent = img.dataset.title;
    modalDesc.textContent = img.dataset.desc;

    // Esperar a que cargue la imagen
    modalImg.onload = () => {
      modalInfo.style.width = modalImg.clientWidth + "px";
    };

    modalImg.src = img.src;
  });
});

// Cerrar con ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.style.display = "none";
  }
});

// Cerrar con la X
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Cerrar haciendo clic fuera del contenido
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Hacer toda la card clickeable
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") return;

    const img = card.querySelector("img");
    if (img) img.click();
  });
});