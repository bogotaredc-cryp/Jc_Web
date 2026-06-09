const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const icon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

    if (navMenu.classList.contains("active")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
        icon.style.transform = "rotate(180deg)";

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
        icon.style.transform = "rotate(0deg)";

    }

});

document.querySelectorAll("#navMenu a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
        icon.style.transform = "rotate(0deg)";

    });

});

// Cerrar al tocar fuera del menú
document.addEventListener("click", (e) => {

    const clickDentroMenu = navMenu.contains(e.target);
    const clickBoton = menuToggle.contains(e.target);

    if (!clickDentroMenu && !clickBoton && navMenu.classList.contains("active")) {

        navMenu.classList.remove("active");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
        icon.style.transform = "rotate(0deg)";
    }

});