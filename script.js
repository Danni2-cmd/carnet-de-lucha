// --- IMPORTAR FUNCIONES DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// --- CONFIGURACIÓN DE FIREBASE (PEGA AQUÍ LA TUYA) ---
const firebaseConfig = {
    apiKey: "AIzaSyBE9FZI5W4o9856L24m6HrQrA7BdEvjE64",
    authDomain: "liga-lucha-santander.firebaseapp.com",
    projectId: "liga-lucha-santander",
    storageBucket: "liga-lucha-santander.appspot.com",
    messagingSenderId: "402094242632",
    appId: "1:402094242632:web:07f67830a46b5eaa2a917d"
};

// --- INICIALIZACIÓN DE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- CÓDIGO PRINCIPAL ---
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationId = urlParams.get('id');

    if (verificationId) {
        // MODO VERIFICACIÓN: Si hay un 'id' en la URL, oculta el formulario y verifica
        document.getElementById('main-content').style.display = 'none';
        handleVerification(verificationId);
    } else {
        // MODO REGISTRO: Si no hay 'id', configura el formulario
        setupForm();
    }
});

function setupForm() {
    const form = document.getElementById("carnet-form");
    const submitBtn = document.getElementById("submit-btn");
    const statusMessage = document.getElementById("status-message");

    // Lógica para mostrar/ocultar campos del formulario
    const rolSelect = document.getElementById("rol");
    rolSelect.addEventListener("change", () => {
        const valor = rolSelect.value;
        document.getElementById("cargo-container").style.display = valor === "Administrativo" ? "block" : "none";
        document.getElementById("otro-rol-container").style.display = valor === "Otro" ? "block" : "none";
        const tipoEntrenadorContainer = document.getElementById("entrenador-tipo-container");
        tipoEntrenadorContainer.style.display = valor === "Entrenador" ? "block" : "none";
        if (valor !== "Entrenador") document.getElementById("entrenador-estilo-container").style.display = "none";
    });
    document.getElementById("tipoEntrenador").addEventListener("change", (e) => {
        document.getElementById("entrenador-estilo-container").style.display = e.target.value === "Alto Rendimiento" ? "block" : "none";
    });


    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        statusMessage.textContent = "Procesando, por favor espera...";
        statusMessage.style.color = "#333";

        const numeroDocumento = document.getElementById("numeroDocumento").value;
        const fotoFile = document.getElementById("foto").files[0];

        try {
            // 1. Subir la foto a Firebase Storage
            statusMessage.textContent = "Subiendo foto...";
            const fotoPath = `fotos_afiliados/${numeroDocumento}`;
            const storageRef = ref(storage, fotoPath);
            await uploadBytes(storageRef, fotoFile);
            const fotoUrl = await getDownloadURL(storageRef);

            // 2. Preparar los datos (evitando valores 'undefined')
            let rolDetallado = document.getElementById("rol").value;
            if (rolDetallado === "Otro") rolDetallado = document.getElementById("otroRol").value || "ROL SIN ESPECIFICAR";
            if (rolDetallado === "Administrativo") rolDetallado += ` - ${document.getElementById("cargo").value || ''}`;
            
            const afiliadoData = {
                nombre: document.getElementById("nombre").value.toUpperCase(),
                tipoDocumento: document.getElementById("tipoDocumento").value,
                numeroDocumento: numeroDocumento,
                contacto: document.getElementById("contacto").value,
                sangre: document.getElementById("sangre").value.toUpperCase(),
                rol: rolDetallado,
                fotoUrl: fotoUrl,
                fechaRegistro: new Date().toISOString()
            };

            // 3. Guardar en Firestore
            statusMessage.textContent = "Guardando información...";
            await setDoc(doc(db, "afiliados", numeroDocumento), afiliadoData);
            
            statusMessage.textContent = "¡Registro exitoso!";
            form.reset();
            displayCarnet(afiliadoData, true); // true = mostrar botón de descarga

        } catch (error) {
            console.error("ERROR DETALLADO:", error);
            statusMessage.textContent = `Error al registrar. Revisa la consola para más detalles.`;
            statusMessage.style.color = "red";
        } finally {
            submitBtn.disabled = false;
        }
    });
}

async function handleVerification(id) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    carnetWrapper.innerHTML = '<h3>Buscando carnet en la base de datos...</h3>';
    try {
        const docRef = doc(db, "afiliados", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            displayCarnet(docSnap.data(), false); // false = no mostrar botón de descarga
        } else {
            carnetWrapper.innerHTML = '<h1>Error: Afiliado no encontrado.</h1>';
        }
    } catch (error) {
        console.error("Error en verificación:", error);
        carnetWrapper.innerHTML = '<h1>Error al verificar el carnet.</h1>';
    }
}

function displayCarnet(data, showDownloadButton) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    const carnetHTML = `
      <div class="carnet-container" style="display: flex;">
        <h3>${showDownloadButton ? 'Vista Previa del Carnet' : 'Carnet Verificado'}</h3>
        <div id="carnet-virtual">
            <div class="carnet-header"><img src="logo.png" class="logo-carnet" alt="Logo"><span>LIGA SANTANDEREANA DE LUCHA OLÍMPICA</span></div>
            <div class="carnet-body">
                <div class="foto-container"><img id="carnet-foto" src="${data.fotoUrl}"></div>
                <div class="info-container">
                    <div class="info-nombre"><p>${data.nombre}</p><span>${data.tipoDocumento} ${data.numeroDocumento}</span></div>
                    <div class="rol-barra" data-rol="${data.rol.toLowerCase()}"><span>${data.rol.toUpperCase()}</span></div>
                    <div class="info-detalles">
                        <div class="detalles-contacto"><label>Contacto de emergencia:</label><span>${data.contacto}</span><span id="carnet-sangre">RH: ${data.sangre}</span></div>
                        <div id="carnet-qr" class="qr-code"></div>
                    </div>
                </div>
            </div>
        </div>
        ${showDownloadButton ? `<button id="descargar-pdf" class="btn btn-secondary">Descargar en PDF</button>` : `<h3 style="color: var(--verde-santander);">✓ Carnet Válido</h3>`}
    `;
    carnetWrapper.innerHTML = carnetHTML;
    
    // Generar QR
    const verificationUrl = `${window.location.origin}${window.location.pathname}?id=${data.numeroDocumento}`;
    new QRCode(document.getElementById('carnet-qr'), { text: verificationUrl, width: 128, height: 128 });

    // Añadir funcionalidad al botón de descarga si existe
    if (showDownloadButton) {
        document.getElementById('descargar-pdf').addEventListener('click', () => {
            const carnetElement = document.getElementById('carnet-virtual');
            const opt = {
              margin: 0,
              filename: `Carnet_${data.nombre.replace(/\s+/g, '_')}.pdf`,
              image: { type: 'jpeg', quality: 1.0 },
              html2canvas: { scale: 4, useCORS: true },
              jsPDF: { unit: 'mm', format: [85.6, 54], orientation: 'landscape' }
            };
            html2pdf().from(carnetElement).set(opt).save();
        });
    }
}
