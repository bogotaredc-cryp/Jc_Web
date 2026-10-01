
// ======================================================
// FIREBASE — CLASIFICADOS
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ======================================================
// CONFIGURACIÓN FIREBASE
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


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ======================================================
// ADMIN
// ======================================================

const ADMIN_UID =
    "hZghskrHnIZ5DYjSXwIM7FUjNjE3";


// ======================================================
// ELEMENTOS HTML
// ======================================================

const businessesContainer =
    document.getElementById(
        "businesses-container"
    );

const pendingBusinesses =
    document.getElementById(
        "pending-businesses"
    );

const approvedBusinesses =
    document.getElementById(
        "approved-businesses"
    );

const rejectedBusinesses =
    document.getElementById(
        "rejected-businesses"
    );


// ======================================================
// PROTECCIÓN DEL PANEL
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        return;
    }

    if (user.uid !== ADMIN_UID) {

        await signOut(auth);

        return;
    }

    console.log(
        "Clasificados: administrador autorizado."
    );

    await loadBusinesses();
});


// ======================================================
// CARGAR NEGOCIOS
// ======================================================

async function loadBusinesses() {

    if (!businessesContainer) {
        return;
    }

    businessesContainer.innerHTML = `
        <div class="loading">
            Cargando negocios...
        </div>
    `;

    try {

        const snapshot =
            await getDocs(
                collection(db, "businesses")
            );


        let pending = 0;
        let approved = 0;
        let rejected = 0;


        // --------------------------------------------------
        // CONTADORES
        // --------------------------------------------------

        snapshot.forEach((businessDoc) => {

            const business =
                businessDoc.data();

            if (business.status === "pending") {
                pending++;
            }

            if (business.status === "approved") {
                approved++;
            }

            if (business.status === "rejected") {
                rejected++;
            }

        });


        if (pendingBusinesses) {
            pendingBusinesses.textContent =
                pending;
        }

        if (approvedBusinesses) {
            approvedBusinesses.textContent =
                approved;
        }

        if (rejectedBusinesses) {
            rejectedBusinesses.textContent =
                rejected;
        }


        // --------------------------------------------------
        // SIN NEGOCIOS
        // --------------------------------------------------

        if (snapshot.empty) {

            businessesContainer.innerHTML = `
                <div class="loading">
                    No hay negocios registrados.
                </div>
            `;

            return;
        }


        businessesContainer.innerHTML = "";


        // --------------------------------------------------
        // CREAR TARJETAS
        // --------------------------------------------------

        snapshot.forEach((businessDoc) => {

            const business =
                businessDoc.data();

            const card =
                createBusinessCard(
                    businessDoc.id,
                    business
                );

            businessesContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Error cargando negocios:",
            error
        );

        businessesContainer.innerHTML = `
            <div class="loading">
                No fue posible cargar los negocios.
            </div>
        `;

    }
}


// ======================================================
// CREAR TARJETA
// ======================================================

function createBusinessCard(id, business) {

    const article =
        document.createElement("article");

    article.className =
        "business-admin-card";


    // ==================================================
    // ESTADO
    // ==================================================

    let statusClass =
        "pending";

    let statusText =
        "Pendiente";


    if (business.status === "approved") {

        statusClass =
            "approved";

        statusText =
            "Aprobado";
    }


    if (business.status === "rejected") {

        statusClass =
            "rejected";

        statusText =
            "Rechazado";
    }


    // ==================================================
    // BOTONES
    // ==================================================

    let actionButtons = "";


    // --------------------------------------------------
    // PENDIENTE
    // --------------------------------------------------

    if (business.status === "pending") {

        actionButtons = `
            <button
                type="button"
                class="primary-btn business-approve-btn"
                data-id="${escapeAttribute(id)}"
            >
                Aprobar
            </button>

            <button
                type="button"
                class="secondary-btn business-reject-btn"
                data-id="${escapeAttribute(id)}"
            >
                Rechazar
            </button>
        `;
    }


    // --------------------------------------------------
    // APROBADO
    // --------------------------------------------------

    if (business.status === "approved") {

        actionButtons = `
            <button
                type="button"
                class="secondary-btn business-reject-btn"
                data-id="${escapeAttribute(id)}"
            >
                Retirar publicación
            </button>
        `;
    }


    // --------------------------------------------------
    // RECHAZADO
    // --------------------------------------------------

    if (business.status === "rejected") {

        actionButtons = `
            <button
                type="button"
                class="primary-btn business-approve-btn"
                data-id="${escapeAttribute(id)}"
            >
                Aprobar
            </button>
        `;
    }


    // --------------------------------------------------
    // ELIMINAR
    // --------------------------------------------------

    actionButtons += `
        <button
            type="button"
            class="danger-btn business-delete-btn"
            data-id="${escapeAttribute(id)}"
        >
            Eliminar
        </button>
    `;


    // ==================================================
    // HTML DE LA TARJETA
    // ==================================================

    article.innerHTML = `

        <div class="business-admin-image">

            <img
                src="${escapeAttribute(
                    business.image || ""
                )}"

                alt="${escapeAttribute(
                    business.name || "Negocio"
                )}"

                loading="lazy"
            >

        </div>


        <div class="business-admin-content">


            <!-- CABECERA -->

            <div class="business-admin-header">

                <div>

                    <span
                        class="business-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                    <h3>
                        ${escapeHTML(
                            business.name ||
                            "Sin nombre"
                        )}
                    </h3>

                </div>

            </div>


            <!-- CATEGORÍA -->

            <p class="business-admin-category">

                ${escapeHTML(
                    business.category ||
                    "Sin categoría"
                )}

            </p>


            <!-- DESCRIPCIÓN -->

            <p class="business-admin-description">

                ${escapeHTML(
                    business.description ||
                    "Sin descripción"
                )}

            </p>


            <!-- INFORMACIÓN -->

            <div class="business-admin-info">

                ${
                    business.city
                        ? `
                            <span>
                                <strong>Ciudad:</strong>
                                ${escapeHTML(
                                    business.city
                                )}
                            </span>
                        `
                        : ""
                }


                ${
                    business.whatsapp
                        ? `
                            <span>
                                <strong>WhatsApp:</strong>
                                ${escapeHTML(
                                    business.whatsapp
                                )}
                            </span>
                        `
                        : ""
                }


                ${
                    business.instagram
                        ? `
                            <span>
                                <strong>Instagram:</strong>
                                ${escapeHTML(
                                    business.instagram
                                )}
                            </span>
                        `
                        : ""
                }


                ${
                    business.website
                        ? `
                            <span>
                                <strong>Sitio web:</strong>
                                ${escapeHTML(
                                    business.website
                                )}
                            </span>
                        `
                        : ""
                }


                ${
                    business.document
                        ? `
                            <span>
                                <strong>Documento:</strong>
                                ${escapeHTML(
                                    business.document
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            <!-- ACCIONES -->

            <div class="business-admin-actions">

                ${actionButtons}

            </div>

        </div>
    `;


    // ==================================================
    // APROBAR
    // ==================================================

    const approveButton =
        article.querySelector(
            ".business-approve-btn"
        );


    if (approveButton) {

        approveButton.addEventListener(
            "click",
            async () => {

                approveButton.disabled =
                    true;

                approveButton.textContent =
                    "Aprobando...";

                await updateBusinessStatus(
                    id,
                    "approved"
                );

            }
        );

    }


    // ==================================================
    // RECHAZAR / RETIRAR
    // ==================================================

    const rejectButton =
        article.querySelector(
            ".business-reject-btn"
        );


    if (rejectButton) {

        rejectButton.addEventListener(
            "click",
            async () => {

                const message =
                    business.status === "approved"
                        ? "¿Quieres retirar este negocio de la publicación?"
                        : "¿Quieres rechazar este negocio?";


                const confirmed =
                    confirm(message);


                if (!confirmed) {
                    return;
                }


                rejectButton.disabled =
                    true;

                rejectButton.textContent =
                    "Procesando...";


                await updateBusinessStatus(
                    id,
                    "rejected"
                );

            }
        );

    }


    // ==================================================
    // ELIMINAR
    // ==================================================

    const deleteButton =
        article.querySelector(
            ".business-delete-btn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            async () => {

                const confirmed =
                    confirm(
                        "¿Seguro que quieres eliminar este negocio definitivamente?"
                    );


                if (!confirmed) {
                    return;
                }


                deleteButton.disabled =
                    true;

                deleteButton.textContent =
                    "Eliminando...";


                await deleteBusiness(id);

            }
        );

    }


    return article;
}


// ======================================================
// CAMBIAR ESTADO
// ======================================================

async function updateBusinessStatus(
    id,
    status
) {

    try {

        const businessReference =
            doc(
                db,
                "businesses",
                id
            );


        await updateDoc(
            businessReference,
            {
                status: status,

                updatedAt:
                    serverTimestamp()
            }
        );


        await loadBusinesses();


    } catch (error) {

        console.error(
            "Error actualizando negocio:",
            error
        );


        alert(
            "No fue posible actualizar el negocio."
        );

    }

}


// ======================================================
// ELIMINAR
// ======================================================

async function deleteBusiness(id) {

    try {

        const businessReference =
            doc(
                db,
                "businesses",
                id
            );


        await deleteDoc(
            businessReference
        );


        await loadBusinesses();


    } catch (error) {

        console.error(
            "Error eliminando negocio:",
            error
        );


        alert(
            "No fue posible eliminar el negocio."
        );

    }

}


// ======================================================
// SEGURIDAD HTML
// ======================================================

function escapeHTML(value = "") {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;
}


function escapeAttribute(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

