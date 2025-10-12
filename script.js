// --- IMPORTAR FUNCIONES DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyBE9FZI5W4o9856L24m6HrQrA7BdEvjE64",
    authDomain: "liga-lucha-santander.firebaseapp.com",
    projectId: "liga-lucha-santander",
    storageBucket: "liga-lucha-santander.firebasestorage.app",
    messagingSenderId: "402094242632",
    appId: "1:402094242632:web:07f67830a46b5eaa2a917d"
};

// --- INICIALIZACIÓN DE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// --- CÓDIGO PRINCIPAL ---
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationId = urlParams.get('id');
    const mainContent = document.querySelector('.main-content');
    if (verificationId) {
        if (mainContent) mainContent.style.display = 'none';
        handleVerification(verificationId);
    } else {
        setupForm();
    }
});

async function handleVerification(id) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    try {
        const docRef = doc(db, "afiliados", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            displayCarnet(docSnap.data(), false);
        } else {
            carnetWrapper.innerHTML = '<h1>Error: Afiliado no encontrado.</h1>';
        }
    } catch (error) {
        console.error("Error:", error);
        carnetWrapper.innerHTML = '<h1>Error al verificar el carnet.</h1>';
    }
}

function setupForm() {
    const form = document.getElementById("carnet-form");
    if (!form) return;
    
    const submitBtn = document.getElementById("submit-btn");
    const statusMessage = document.getElementById("status-message");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        submitBtn.disabled = true;
        statusMessage.textContent = "Registrando, por favor espera...";
        statusMessage.style.color = "#333";

        const numeroDocumento = document.getElementById("numeroDocumento").value;
        const fotoFile = document.getElementById("foto").files[0];

        if (!fotoFile || !numeroDocumento) {
            alert("Completa el documento y la foto.");
            submitBtn.disabled = false;
            statusMessage.textContent = "";
            return;
        }

        let rolSeleccionado = document.getElementById("rol").value;
        let rolParaGuardar = rolSeleccionado;
        if (rolSeleccionado === "Otro") {
            rolParaGuardar = document.getElementById("otroRol").value || "ROL SIN ESPECIFICAR";
        }
        if (rolSeleccionado === "Entrenador") {
            const tipo = document.getElementById("tipoEntrenador").value;
            rolParaGuardar = `Entrenador (${tipo})`;
            if (tipo === 'Alto Rendimiento') {
                rolParaGuardar += ` - ${document.getElementById("estiloLucha").value}`;
            }
        }
        if (rolSeleccionado === "Administrativo") {
            const cargo = document.getElementById("cargo").value;
            if (cargo) rolParaGuardar += ` - ${cargo}`;
        }

        try {
            statusMessage.textContent = "Subiendo foto...";
            const fotoPath = `fotos/${numeroDocumento}_${Date.now()}`;
            const storageRef = ref(storage, fotoPath);
            await uploadBytes(storageRef, fotoFile);
            const downloadURL = await getDownloadURL(storageRef);

            const afiliadoData = {
                nombre: document.getElementById("nombre").value.toUpperCase(),
                tipoDocumento: document.getElementById("tipoDocumento").value,
                numeroDocumento: numeroDocumento,
                contacto: document.getElementById("contacto").value,
                sangre: document.getElementById("sangre").value.toUpperCase(),
                rol: rolParaGuardar,
                fotoUrl: downloadURL,
                fechaRegistro: new Date().toISOString()
            };

            statusMessage.textContent = "Guardando información...";
            await setDoc(doc(db, "afiliados", numeroDocumento), afiliadoData);
            
            statusMessage.textContent = "¡Registro exitoso!";
            form.reset();
            displayCarnet(afiliadoData, true);

        } catch (error) {
            console.error("Error detallado:", error);
            statusMessage.textContent = `Error al registrar. Revisa la consola (F12) para más detalles.`;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function displayCarnet(data, showDownloadButton) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    // ESTRUCTURA HTML MODIFICADA
    const carnetHTML = `
      <div class="vista-previa-container">
          <h3>${showDownloadButton ? 'Vista Previa del Carnet' : 'Carnet Verificado'}</h3>
          <div id="carnet-a-descargar">
              <div class="carnet-header">
                  <img src="logo.png" alt="Logo Liga">
                  <h2>LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
              </div>
              <div class="carnet-body">
                  <img class="foto-afiliado" src="${data.fotoUrl}" alt="Foto">
                  <div class="carnet-info">
                      <div class="info-principal">
                          <strong class="nombre-afiliado">${data.nombre}</strong>
                          <span class="documento-afiliado">${data.tipoDocumento} ${data.numeroDocumento}</span>
                          <div class="rol-barra"><span>${data.rol}</span></div>
                      </div>
                      <div class="info-secundaria">
                          <div class="contacto-texto">
                              <strong>Contacto Emer:</strong> ${data.contacto}<br>
                              <strong>Sangre y RH:</strong> ${data.sangre}
                          </div>
                          <div id="qr-code-container"></div>
                      </div>
                  </div>
              </div>
          </div>
          ${showDownloadButton ? `<div id="imprimir-btn-container"><button id="imprimir-btn" class="btn-imprimir">Imprimir o Guardar como PDF</button></div>` : ''}
          ${!showDownloadButton ? `<h3 class="verificado-mensaje">✓ Carnet Válido y Verificado</h3>` : ''}
      </div>
    `;

    carnetWrapper.innerHTML = carnetHTML;
    
    const rolBarra = carnetWrapper.querySelector('.rol-barra');
    if (data.rol.toLowerCase().includes('deportista')) {
        rolBarra.style.backgroundColor = '#FCD116';
    } else if (data.rol.toLowerCase().includes('entrenador')) {
        rolBarra.style.backgroundColor = '#00843D';
    } else {
        rolBarra.style.backgroundColor = '#333';
    }

    if (document.getElementById("qr-code-container")) {
        const qrCodeContainer = document.getElementById("qr-code-container");
        const verificationUrl = `${window.location.origin}${window.location.pathname}?id=${data.numeroDocumento}`;
        new QRCode(qrCodeContainer, { text: verificationUrl, width: 65, height: 65 }); // QR más pequeño
    }

    if (showDownloadButton) {
        document.getElementById("imprimir-btn").addEventListener("click", function () {
            window.print();
        });
    }
}
