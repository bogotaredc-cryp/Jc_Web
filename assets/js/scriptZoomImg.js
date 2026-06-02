const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const closeBtn = document.querySelector(".close");

document.querySelectorAll(".card img").forEach(img => {
  img.addEventListener("click", () => {
    modal.style.display = "block";

    modalImg.src = img.src;
    modalTitle.textContent = img.dataset.title;
    modalDesc.textContent = img.dataset.desc;
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.style.display = "none";
  }
});

closeBtn.onclick = () => {
  modal.style.display = "none";
};

modal.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};
// 👉 hacer TODA la card clickeable
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", (e) => {

    // ❌ si se hace click en la imagen, NO hacer esto
    if (e.target.tagName === "IMG") return;

    // 👉 simulamos click en la imagen para abrir modal
    const img = card.querySelector("img");
    if (img) img.click();
  });
});