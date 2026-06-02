const reveals = document.querySelectorAll(".reveal");
const timeline = document.querySelector(".timeline");

window.addEventListener("scroll", () => {
  const trigger = window.innerHeight * 0.85;

  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < trigger) {
      el.classList.add("active");
    }
  });

  // activar línea timeline
  if (timeline) {
    const top = timeline.getBoundingClientRect().top;
    if (top < trigger) {
      timeline.classList.add("active");
    }
  }
});