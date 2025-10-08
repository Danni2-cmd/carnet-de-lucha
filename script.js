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

        // --- LÓGICA AÑADIDA PARA ROLES CONDICIONALES ---
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
        // --- FIN DE LA LÓGICA AÑADIDA ---

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
                rol: rolParaGuardar, // Se guarda el rol detallado
                fotoUrl: downloadURL,
                fechaRegistro: new Date().toISOString()
            };

            statusMessage.textContent = "Guardando información...";
            await setDoc(doc(db, "afiliados", numeroDocumento), afiliadoData);
            
            statusMessage.textContent = "¡Registro exitoso!";
            form.reset();
            displayCarnet(afiliadoData, true);

        } catch (error) {
            console.error("Error:", error);
            statusMessage.textContent = `Error al registrar.`;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

function displayCarnet(data, showDownloadButton) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    // Se usa un gradiente sutil con los colores de Santander
    const carnetHTML = `
      <div style="margin-top:20px; text-align:center;"><h3>Vista Previa del Carnet</h3></div>
      <div id="carnet-a-descargar" style="border: 2px solid #000000; background: linear-gradient(135deg, rgba(255,253,240,1) 0%, rgba(232,248,245,1) 100%); border-radius: 12px; padding: 16px; width: 428px; font-family: 'Poppins', Arial, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">
              <img src="logo.png" alt="Logo Liga" style="max-width: 60px;">
              <h2 style="color: #004d00; margin: 4px 0; font-size: 14px; font-weight: 700;">LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
              <img src="${data.fotoUrl}" alt="Foto" style="width: 110px; height: 140px; object-fit: cover; border-radius: 8px;">
              <div style="font-size: 14px; flex-grow: 1; text-align: left;">
                  <strong style="font-size: 18px; font-weight: 900; display: block;">${data.nombre}</strong>
                  <span style="display: block; color: #555; margin-bottom: 8px;">${data.tipoDocumento} ${data.numeroDocumento}</span>
                  <strong>Rol:</strong> ${data.rol}<br>
                  <strong>Contacto Emer:</strong> ${data.contacto}<br>
                  <strong>Sangre y RH:</strong> ${data.sangre}
              </div>
              <div id="qr-code-container" style="width: 80px; height: 80px; align-self: flex-end;"></div>
          </div>
      </div>
      ${showDownloadButton ? `<div id="imprimir-btn-container" style="text-align: center; margin-top: 20px;"><button id="imprimir-btn" style="padding: 12px 25px; background-color: #00843D; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">Imprimir o Guardar como PDF</button></div>` : ''}
      ${!showDownloadButton ? `<h3 style="text-align:center; color: #026937;">✓ Carnet Válido y Verificado</h3>` : ''}
    `;

    carnetWrapper.innerHTML = carnetHTML;
    
    if (document.getElementById("qr-code-container")) {
        const qrCodeContainer = document.getElementById("qr-code-container");
        const verificationUrl = `${window.location.origin}${window.location.pathname}?id=${data.numeroDocumento}`;
        new QRCode(qrCodeContainer, { text: verificationUrl, width: 80, height: 80 });
    }

    if (showDownloadButton) {
        document.getElementById("imprimir-btn").addEventListener("click", function () {
            window.print();
        });
    }
}