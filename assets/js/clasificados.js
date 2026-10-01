
// ==========================================
// CLASIFICADOS DE NEGOCIOS
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

import {
    db
} from "./firebase.js";


// ==========================================
// CONFIGURACIÓN
// ==========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbyQBsBk_Ak8IkDWXbrpt6YLsKfgamw69ljCcUXkU3hLcIWeVI1OYI93dnk1T6VjPIY7UA/exec";

const REGISTRO_URL =
    "https://forms.gle/jDBnqLmejiUXY5BY8";


// ==========================================
// ELEMENTOS
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


// ==========================================
// VERIFICAR REGISTRO
// ==========================================

async function verificarRegistro() {

    const documento =
        documentoInput.value.trim();

    if (!documento) {

        mostrarMensaje(
            "Por favor, ingresa tu número de documento.",
            "error"
        );

        return;
    }

    verificarBtn.disabled = true;

    verificarBtn.textContent =
        "Verificando...";

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

        const data =
            await response.json();

        console.log(
            "Respuesta de Apps Script:",
            data
        );


        // ==================================
        // PERSONA REGISTRADA
        // ==================================

        if (
            data.success &&
            data.exists
        ) {

            mostrarMensaje(
                "¡Registro verificado! Ya puedes registrar tu negocio.",
                "success"
            );

            businessForm.dataset.documento =
                documento;

            mostrarFormularioNegocio();

            return;
        }


        // ==================================
        // PERSONA NO REGISTRADA
        // ==================================

        if (
            data.success &&
            !data.exists
        ) {

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


        // ==================================
        // ERROR DE API
        // ==================================

        mostrarMensaje(
            data.message ||
            "No fue posible verificar el registro.",
            "error"
        );

    } catch (error) {

        console.error(
            "Error verificando registro:",
            error
        );

        mostrarMensaje(
            "No fue posible realizar la verificación. Inténtalo nuevamente.",
            "error"
        );

    } finally {

        verificarBtn.disabled = false;

        verificarBtn.textContent =
            "Verificar registro";
    }
}


// ==========================================
// GUARDAR NEGOCIO
// ==========================================

async function guardarNegocio(event) {

    event.preventDefault();

    const documento =
        businessForm.dataset.documento;

    if (!documento) {

        mostrarFormularioMensaje(
            "Primero debes verificar tu documento.",
            "error"
        );

        return;
    }


    // ==================================
    // DATOS
    // ==================================

    const name =
        document.getElementById("business-name")
            .value.trim();

    const category =
        document.getElementById("business-category")
            .value;

    const description =
        document.getElementById("business-description")
            .value.trim();

    const city =
        document.getElementById("business-city")
            .value.trim();

    const whatsapp =
        document.getElementById("business-whatsapp")
            .value.trim();

    const instagram =
        document.getElementById("business-instagram")
            .value.trim();

    const website =
        document.getElementById("business-website")
            .value.trim();

    const image =
        document.getElementById("business-image")
            .value.trim();


    // ==================================
    // VALIDACIÓN
    // ==================================

    if (
        !name ||
        !category ||
        !description ||
        !city ||
        !whatsapp ||
        !image
    ) {

        mostrarFormularioMensaje(
            "Completa todos los campos obligatorios.",
            "error"
        );

        return;
    }


    businessSubmitBtn.disabled = true;

    businessSubmitBtn.textContent =
        "Enviando...";

    limpiarFormularioMensaje();


    // ==================================
    // FIRESTORE
    // ==================================

    try {

        await addDoc(
            collection(db, "businesses"),
            {
                name: name,
                category: category,
                description: description,
                city: city,
                whatsapp: whatsapp,
                instagram: instagram,
                website: website,
                image: image,
                document: documento,
                status: "pending",
                createdAt: serverTimestamp()
            }
        );


        mostrarFormularioMensaje(
            "¡Negocio enviado correctamente! Quedará pendiente de revisión.",
            "success"
        );

        businessForm.reset();

        delete businessForm.dataset.documento;

    } catch (error) {

        console.error(
            "Error guardando negocio:",
            error
        );

        mostrarFormularioMensaje(
            "No fue posible enviar el negocio. Inténtalo nuevamente.",
            "error"
        );

    } finally {

        businessSubmitBtn.disabled = false;

        businessSubmitBtn.textContent =
            "Enviar negocio a revisión";
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

        const businessesRef =
            collection(db, "businesses");

        const businessesQuery =
            query(
                businessesRef,
                where("status", "==", "approved")
            );

        const snapshot =
            await getDocs(businessesQuery);


        // ==================================
        // SIN NEGOCIOS
        // ==================================

        if (snapshot.empty) {

            businessContainer.innerHTML = `
                <p class="clasificados-empty">
                    Aún no hay negocios publicados.
                </p>
            `;

            return;
        }


        // ==================================
        // CREAR TARJETAS
        // ==================================

        businessContainer.innerHTML = "";

        snapshot.forEach((doc) => {

            const business =
                doc.data();

            const card =
                crearTarjetaNegocio(business);

            businessContainer.appendChild(card);
        });

    } catch (error) {

        console.error(
            "Error cargando negocios:",
            error
        );

        businessContainer.innerHTML = `
            <p class="clasificados-error">
                No fue posible cargar los negocios.
            </p>
        `;
    }
}


// ==========================================
// CREAR TARJETA
// ==========================================

function crearTarjetaNegocio(business) {

    const card =
        document.createElement("article");

    card.className =
        "negocio-card";


    // ==================================
    // IMAGEN
    // ==================================

    const image =
        document.createElement("img");

    image.className =
        "negocio-image";

    image.src =
        business.image;

    image.alt =
        business.name || "Negocio";

    image.loading =
        "lazy";


    // ==================================
    // CONTENIDO
    // ==================================

    const content =
        document.createElement("div");

    content.className =
        "negocio-content";


    // Categoría
    const category =
        document.createElement("span");

    category.className =
        "negocio-category";

    category.textContent =
        business.category || "Negocio";


    // Nombre
    const title =
        document.createElement("h3");

    title.textContent =
        business.name || "Sin nombre";


    // Descripción
    const description =
        document.createElement("p");

    description.className =
        "negocio-description";

    description.textContent =
        business.description || "";


    // ==================================
    // INFORMACIÓN
    // ==================================

    const info =
        document.createElement("div");

    info.className =
        "negocio-info";


    if (business.city) {

        const city =
            document.createElement("span");

        city.innerHTML =
            `<i class="fas fa-location-dot"></i> ${escapeHTML(business.city)}`;

        info.appendChild(city);
    }


    // ==================================
    // BOTONES
    // ==================================

    const actions =
        document.createElement("div");

    actions.className =
        "negocio-actions";


    // WhatsApp
    if (business.whatsapp) {

        const whatsapp =
            document.createElement("a");

        whatsapp.className =
            "negocio-btn primary";

        const numero =
            business.whatsapp.replace(
                /\D/g,
                ""
            );

        const mensaje =
            encodeURIComponent(
                `Hola, vi tu negocio en josecuestanovoa.com y quisiera obtener más información sobre ${business.name || "tu negocio"}.`
            );

        whatsapp.href =
            `https://wa.me/${numero}?text=${mensaje}`;

        whatsapp.target =
            "_blank";

        whatsapp.rel =
            "noopener noreferrer";

        whatsapp.innerHTML =
            `<i class="fab fa-whatsapp"></i> WhatsApp`;

        actions.appendChild(whatsapp);
    }


    // Instagram
    if (business.instagram) {

        const instagram =
            document.createElement("a");

        instagram.className =
            "negocio-btn secondary";

        let instagramURL =
            business.instagram.trim();

        if (
            instagramURL &&
            !instagramURL.startsWith("http")
        ) {

            instagramURL =
                `https://instagram.com/${instagramURL.replace(/^@/, "")}`;
        }

        instagram.href =
            instagramURL;

        instagram.target =
            "_blank";

        instagram.rel =
            "noopener noreferrer";

        instagram.innerHTML =
            `<i class="fab fa-instagram"></i> Instagram`;

        actions.appendChild(instagram);
    }


    // Sitio web
    if (business.website) {

        const website =
            document.createElement("a");

        website.className =
            "negocio-btn secondary";

        website.href =
            business.website;

        website.target =
            "_blank";

        website.rel =
            "noopener noreferrer";

        website.innerHTML =
            `<i class="fas fa-globe"></i> Sitio web`;

        actions.appendChild(website);
    }


    // ==================================
    // ARMAR TARJETA
    // ==================================

    content.appendChild(category);

    content.appendChild(title);

    content.appendChild(description);

    content.appendChild(info);

    if (actions.children.length > 0) {

        content.appendChild(actions);
    }

    card.appendChild(image);

    card.appendChild(content);

    return card;
}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


// ==========================================
// FORMULARIO
// ==========================================

function mostrarFormularioNegocio() {

    if (!businessFormContainer) {
        return;
    }

    businessFormContainer.hidden =
        false;
}


function ocultarFormularioNegocio() {

    if (!businessFormContainer) {
        return;
    }

    businessFormContainer.hidden =
        true;
}


// ==========================================
// MENSAJES DE VERIFICACIÓN
// ==========================================

function mostrarMensaje(texto, tipo) {

    if (!verificationMessage) {
        return;
    }

    verificationMessage.textContent =
        texto;

    verificationMessage.className =
        `verification-message ${tipo}`;
}


function mostrarMensajeHTML(html, tipo) {

    if (!verificationMessage) {
        return;
    }

    verificationMessage.innerHTML =
        html;

    verificationMessage.className =
        `verification-message ${tipo}`;
}


function limpiarMensaje() {

    if (!verificationMessage) {
        return;
    }

    verificationMessage.textContent =
        "";

    verificationMessage.className =
        "verification-message";
}


// ==========================================
// MENSAJES DEL FORMULARIO
// ==========================================

function mostrarFormularioMensaje(
    texto,
    tipo
) {

    if (!businessFormMessage) {
        return;
    }

    businessFormMessage.textContent =
        texto;

    businessFormMessage.className =
        `business-form-message ${tipo}`;
}


function limpiarFormularioMensaje() {

    if (!businessFormMessage) {
        return;
    }

    businessFormMessage.textContent =
        "";

    businessFormMessage.className =
        "business-form-message";
}


// ==========================================
// EVENTOS
// ==========================================

// Verificar documento
if (verificarBtn) {

    verificarBtn.addEventListener(
        "click",
        verificarRegistro
    );
}


// ENTER en documento
if (documentoInput) {

    documentoInput.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                verificarRegistro();
            }
        }
    );
}


// Formulario
if (businessForm) {

    businessForm.addEventListener(
        "submit",
        guardarNegocio
    );
}


// ==========================================
// INICIALIZAR
// ==========================================

// Ocultar formulario inicialmente
ocultarFormularioNegocio();

// Cargar negocios aprobados
cargarNegociosAprobados();

