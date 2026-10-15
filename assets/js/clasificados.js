// ==========================================
// CLASIFICADOS DE NEGOCIOS
// Flujo de imágenes mediante URL
// ==========================================

// ==========================================
// FIREBASE
// ==========================================

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "./firebase.js";


// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyQBsBk_Ak8IkDWXbrpt6YLsKfgamw69ljCcUXkU3hLcIWeVI1OYI93dnk1T6VjPIY7UA/exec";

const REGISTRO_URL =
    "https://forms.gle/jDBnqLmejiUXY5BY8";


// ==========================================
// ELEMENTOS HTML
// ==========================================

const documentoInput =
    document.getElementById("documento-verificacion");

const verificarBtn =
    document.getElementById("verificar-registro");

const verificationMessage =
    document.getElementById("verification-message");

const businessFormContainer =
    document.getElementById("business-form-container");

const businessForm =
    document.getElementById("business-form");

const businessSubmitBtn =
    document.getElementById("business-submit-btn");

const businessFormMessage =
    document.getElementById("business-form-message");

const businessContainer =
    document.getElementById("business-container");

const businessImageInput =
    document.getElementById("business-image");

const imagePreviewContainer =
    document.getElementById("business-image-preview-container");

const imagePreview =
    document.getElementById("business-image-preview");

const removeImageBtn =
    document.getElementById("business-image-remove");


// ==========================================
// VALIDAR URL DE IMAGEN
// ==========================================

function obtenerURLImagen(valor) {
    try {
        const url = new URL(valor.trim());

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return null;
        }

        return url.href;

    } catch {
        return null;
    }
}


// ==========================================
// VISTA PREVIA DE IMAGEN
// ==========================================

function limpiarVistaPrevia() {
    if (imagePreview) {
        imagePreview.onload = null;
        imagePreview.onerror = null;
        imagePreview.removeAttribute("src");
    }

    if (imagePreviewContainer) {
        imagePreviewContainer.hidden = true;
    }
}


function actualizarVistaPrevia() {
    if (!businessImageInput || !imagePreview || !imagePreviewContainer) {
        console.error(
            "No se encontraron los elementos de vista previa."
        );
        return;
    }

    const valor = businessImageInput.value.trim();

    limpiarVistaPrevia();
    limpiarFormularioMensaje();

    if (!valor) {
        return;
    }

    const urlImagen = obtenerURLImagen(valor);

    if (!urlImagen) {
        mostrarFormularioMensaje(
            "Introduce una URL válida que comience con https:// o http://.",
            "error"
        );
        return;
    }

    imagePreview.onload = () => {
        imagePreviewContainer.hidden = false;
        limpiarFormularioMensaje();

        console.log("Vista previa cargada correctamente.");
    };

    imagePreview.onerror = () => {
        limpiarVistaPrevia();

        mostrarFormularioMensaje(
            "No se pudo cargar la imagen. Comprueba que el enlace sea público y directo.",
            "error"
        );

        console.error(
            "No se pudo cargar la imagen desde:",
            urlImagen
        );
    };

    imagePreview.src = urlImagen;
}


// Actualizar al escribir o pegar el enlace.
businessImageInput?.addEventListener(
    "input",
    actualizarVistaPrevia
);

businessImageInput?.addEventListener(
    "change",
    actualizarVistaPrevia
);


// Botón para quitar la imagen.
removeImageBtn?.addEventListener("click", () => {
    if (businessImageInput) {
        businessImageInput.value = "";
    }

    limpiarVistaPrevia();
    limpiarFormularioMensaje();
});


// ==========================================
// VERIFICAR REGISTRO
// ==========================================

async function verificarRegistro() {
    const documento = documentoInput?.value.trim();

    if (!documento) {
        mostrarMensaje(
            "Por favor, ingresa tu número de documento.",
            "error"
        );
        return;
    }

    if (!verificarBtn) {
        return;
    }

    verificarBtn.disabled = true;
    verificarBtn.textContent = "Verificando...";

    limpiarMensaje();

    try {
        const response = await fetch(
            `${API_URL}?documento=${encodeURIComponent(documento)}`
        );

        if (!response.ok) {
            throw new Error(
                "No se pudo conectar con el servicio."
            );
        }

        const data = await response.json();

        console.log("Respuesta de Apps Script:", data);

        // Persona registrada.
        if (data.success && data.exists) {
            mostrarMensaje(
                "¡Registro verificado! Ya puedes registrar tu negocio.",
                "success"
            );

            if (businessForm) {
                businessForm.dataset.documento = documento;
            }

            mostrarFormularioNegocio();
            return;
        }

        // Persona no registrada.
        if (data.success && !data.exists) {
            mostrarMensajeHTML(
                `
                    <strong>No encontramos tu registro.</strong>
                    <br>
                    Para registrar un negocio primero debes
                    completar nuestro registro.
                    <br><br>
                    <a
                        href="${REGISTRO_URL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-registro"
                    >
                        Registrarme
                    </a>
                `,
                "warning"
            );

            ocultarFormularioNegocio();
            return;
        }

        mostrarMensaje(
            data.message ||
            "No fue posible verificar el registro.",
            "error"
        );

    } catch (error) {
        console.error("Error verificando registro:", error);

        mostrarMensaje(
            "No fue posible realizar la verificación. Inténtalo nuevamente.",
            "error"
        );

    } finally {
        verificarBtn.disabled = false;
        verificarBtn.textContent = "Verificar registro";
    }
}


// ==========================================
// GUARDAR NEGOCIO EN FIREBASE
// ==========================================

async function guardarNegocio(event) {
    event.preventDefault();

    if (!businessForm) {
        return;
    }

    const documento = businessForm.dataset.documento;

    if (!documento) {
        mostrarFormularioMensaje(
            "Primero debes verificar tu documento.",
            "error"
        );
        return;
    }

    const obtenerValor = (id) =>
        document.getElementById(id)?.value.trim() || "";

    const name = obtenerValor("business-name");

    const category =
        document.getElementById("business-category")?.value || "";

    const description = obtenerValor("business-description");
    const city = obtenerValor("business-city");
    const whatsapp = obtenerValor("business-whatsapp");
    const instagram = obtenerValor("business-instagram");
    const website = obtenerValor("business-website");

    const imageValue = businessImageInput?.value.trim() || "";
    const imageURL = obtenerURLImagen(imageValue);

    // Validar campos obligatorios.
    if (
        !name ||
        !category ||
        !description ||
        !city ||
        !whatsapp ||
        !imageValue
    ) {
        mostrarFormularioMensaje(
            "Completa los campos obligatorios e introduce la URL de la imagen.",
            "error"
        );
        return;
    }

    if (!imageURL) {
        mostrarFormularioMensaje(
            "La URL de la imagen no es válida.",
            "error"
        );
        return;
    }

    if (!businessSubmitBtn) {
        mostrarFormularioMensaje(
            "No se encontró el botón de envío.",
            "error"
        );
        return;
    }

    businessSubmitBtn.disabled = true;
    businessSubmitBtn.textContent = "Guardando negocio...";

    limpiarFormularioMensaje();

    try {
        // Comprobar que el enlace realmente muestra una imagen.
        const imagenValida = await new Promise((resolve) => {
            const comprobacion = new Image();

            comprobacion.onload = () => resolve(true);
            comprobacion.onerror = () => resolve(false);

            comprobacion.src = imageURL;
        });

        if (!imagenValida) {
            throw new Error(
                "La imagen no está disponible. Revisa el enlace público."
            );
        }

        // Guardar directamente en Firestore.
        // No se llama al PHP ni se sube ningún archivo.
        await addDoc(collection(db, "businesses"), {
            name,
            category,
            description,
            city,
            whatsapp,
            instagram,
            website,
            image: imageURL,
            document: documento,
            status: "pending",
            createdAt: serverTimestamp()
        });

        mostrarFormularioMensaje(
            "¡Negocio enviado correctamente! Quedará pendiente de revisión.",
            "success"
        );

        businessForm.reset();
        delete businessForm.dataset.documento;

        limpiarVistaPrevia();

    } catch (error) {
        console.error("Error guardando negocio:", error);

        mostrarFormularioMensaje(
            error.message ||
            "No fue posible enviar el negocio. Inténtalo nuevamente.",
            "error"
        );

    } finally {
        businessSubmitBtn.disabled = false;
        businessSubmitBtn.textContent = "Enviar negocio a revisión";
    }
}


// ==========================================
// CARGAR NEGOCIOS APROBADOS
// ==========================================

async function cargarNegociosAprobados() {
    if (!businessContainer) {
        return;
    }

    businessContainer.innerHTML = `
        <p class="clasificados-loading">
            Cargando negocios...
        </p>
    `;

    try {
        const businessesQuery = query(
            collection(db, "businesses"),
            where("status", "==", "approved")
        );

        const snapshot = await getDocs(businessesQuery);

        if (snapshot.empty) {
            businessContainer.innerHTML = `
                <p class="clasificados-empty">
                    Aún no hay negocios publicados.
                </p>
            `;
            return;
        }

        businessContainer.innerHTML = "";

        snapshot.forEach((documento) => {
            const business = documento.data();

            const card = crearTarjetaNegocio(business);

            businessContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando negocios:", error);

        businessContainer.innerHTML = `
            <p class="clasificados-error">
                No fue posible cargar los negocios.
            </p>
        `;
    }
}


// ==========================================
// CREAR TARJETA DE NEGOCIO
// ==========================================

function crearTarjetaNegocio(business) {
    const card = document.createElement("article");
    card.className = "negocio-card";

    // Imagen.
    const imageWrapper = document.createElement("div");
    imageWrapper.className = "negocio-image-wrapper";

    const image = document.createElement("img");
    image.className = "negocio-image";
    image.alt = business.name || "Imagen del negocio";
    image.loading = "lazy";

    const imageURL = obtenerURLImagen(
        typeof business.image === "string"
            ? business.image
            : ""
    );

    if (imageURL) {
        image.src = imageURL;

        image.addEventListener("error", () => {
            console.error(
                "No se pudo cargar la imagen del negocio:",
                business.name,
                imageURL
            );

            imageWrapper.hidden = true;
        });
    } else {
        imageWrapper.hidden = true;
    }

    imageWrapper.appendChild(image);

    // Contenido.
    const content = document.createElement("div");
    content.className = "negocio-content";

    // Categoría.
    const category = document.createElement("span");
    category.className = "negocio-category";
    category.textContent = business.category || "Negocio";

    // Nombre.
    const title = document.createElement("h3");
    title.textContent = business.name || "Sin nombre";

    // Descripción.
    const description = document.createElement("p");
    description.className = "negocio-description";
    description.textContent = business.description || "";

    // Ciudad.
    const info = document.createElement("div");
    info.className = "negocio-info";

    if (business.city) {
        const city = document.createElement("span");

        const locationIcon = document.createElement("i");
        locationIcon.className = "fas fa-location-dot";
        locationIcon.setAttribute("aria-hidden", "true");

        city.appendChild(locationIcon);
        city.appendChild(
            document.createTextNode(` ${business.city}`)
        );

        info.appendChild(city);
    }

    // Botones.
    const actions = document.createElement("div");
    actions.className = "negocio-actions";

    // WhatsApp.
    if (business.whatsapp) {
        const whatsapp = document.createElement("a");
        whatsapp.className =
            "negocio-btn negocio-btn-primary";

        const numero = String(business.whatsapp).replace(/\D/g, "");

        const mensaje = encodeURIComponent(
            `Hola, vi tu negocio en josecuestanovoa.com y quisiera obtener más información sobre ${business.name || "tu negocio"}.`
        );

        whatsapp.href =
            `https://wa.me/${numero}?text=${mensaje}`;

        whatsapp.target = "_blank";
        whatsapp.rel = "noopener noreferrer";

        whatsapp.innerHTML = `
            <i class="fab fa-whatsapp" aria-hidden="true"></i>
            <span>Contactar por WhatsApp</span>
        `;

        actions.appendChild(whatsapp);
    }

    // Instagram.
    if (business.instagram) {
        const instagram = document.createElement("a");
        instagram.className =
            "negocio-btn negocio-btn-secondary";

        let instagramURL = String(business.instagram).trim();

        if (
            instagramURL &&
            !/^https?:\/\//i.test(instagramURL)
        ) {
            instagramURL =
                `https://instagram.com/${instagramURL.replace(/^@/, "")}`;
        }

        if (/^https?:\/\//i.test(instagramURL)) {
            instagram.href = instagramURL;
            instagram.target = "_blank";
            instagram.rel = "noopener noreferrer";

            instagram.innerHTML = `
                <i class="fab fa-instagram" aria-hidden="true"></i>
                <span>Instagram</span>
            `;

            actions.appendChild(instagram);
        }
    }

    // Sitio web.
    if (business.website) {
        let websiteURL = String(business.website).trim();

        if (
            websiteURL &&
            !/^https?:\/\//i.test(websiteURL)
        ) {
            websiteURL = `https://${websiteURL}`;
        }

        if (/^https?:\/\//i.test(websiteURL)) {
            const website = document.createElement("a");

            website.className =
                "negocio-btn negocio-btn-secondary";

            website.href = websiteURL;
            website.target = "_blank";
            website.rel = "noopener noreferrer";

            website.innerHTML = `
                <i class="fas fa-globe" aria-hidden="true"></i>
                <span>Sitio web</span>
            `;

            actions.appendChild(website);
        }
    }

    // Armar tarjeta.
    content.appendChild(category);
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(info);

    if (actions.children.length > 0) {
        content.appendChild(actions);
    }

    card.appendChild(imageWrapper);
    card.appendChild(content);

    return card;
}


// ==========================================
// FORMULARIO
// ==========================================

function mostrarFormularioNegocio() {
    if (businessFormContainer) {
        businessFormContainer.hidden = false;
    }
}

function ocultarFormularioNegocio() {
    if (businessFormContainer) {
        businessFormContainer.hidden = true;
    }
}


// ==========================================
// MENSAJES DE VERIFICACIÓN
// ==========================================

function mostrarMensaje(texto, tipo) {
    if (!verificationMessage) {
        return;
    }

    verificationMessage.textContent = texto;
    verificationMessage.className =
        `verification-message ${tipo}`;
}

function mostrarMensajeHTML(html, tipo) {
    if (!verificationMessage) {
        return;
    }

    verificationMessage.innerHTML = html;
    verificationMessage.className =
        `verification-message ${tipo}`;
}

function limpiarMensaje() {
    if (!verificationMessage) {
        return;
    }

    verificationMessage.textContent = "";
    verificationMessage.className =
        "verification-message";
}


// ==========================================
// MENSAJES DEL FORMULARIO
// ==========================================

function mostrarFormularioMensaje(texto, tipo) {
    if (!businessFormMessage) {
        console.error(texto);
        return;
    }

    businessFormMessage.textContent = texto;
    businessFormMessage.className =
        `business-form-message ${tipo}`;
}

function limpiarFormularioMensaje() {
    if (!businessFormMessage) {
        return;
    }

    businessFormMessage.textContent = "";
    businessFormMessage.className =
        "business-form-message";
}


// ==========================================
// EVENTOS
// ==========================================

// Verificar documento.
verificarBtn?.addEventListener(
    "click",
    verificarRegistro
);

// Enter en documento.
documentoInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        verificarRegistro();
    }
});

// Enviar formulario.
businessForm?.addEventListener(
    "submit",
    guardarNegocio
);


// ==========================================
// INICIALIZAR
// ==========================================

ocultarFormularioNegocio();
cargarNegociosAprobados();

console.log("Clasificados inicializados: modo URL de imagen.");
