// --- PASO 1: IMPORTAR LAS FUNCIONES NECESARIAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// --- PASO 2: CONFIGURACIÓN DE FIREBASE (CON STORAGEBUCKET CORREGIDO) ---
const firebaseConfig = {
    apiKey: "AIzaSyBE9FZI5W4o9856L24m6HrQrA7BdEvjE64",
    authDomain: "liga-lucha-santander.firebaseapp.com",
    projectId: "liga-lucha-santander",
    storageBucket: "liga-lucha-santander.appspot.com", // <-- ¡CORREGIDO!
    messagingSenderId: "402094242632",
    appId: "1:402094242632:web:07f67830a46b5eaa2a917d"
};

// --- PASO 3: INICIALIZACIÓN DE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ... (El resto del script.js es exactamente el mismo que te di en la respuesta anterior) ...

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const verificationId = urlParams.get('id');
    const mainContent = document.querySelector('.main-content');
    const carnetWrapper = document.getElementById("carnet-wrapper");
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
            displayVerifiedCarnet(docSnap.data());
        } else {
            carnetWrapper.innerHTML = '<h1 style="text-align:center; color: #d42e12; padding-top: 50px;">Error: Afiliado no encontrado en la base de datos.</h1>';
        }
    } catch (error) {
        console.error("Error obteniendo el documento:", error);
        carnetWrapper.innerHTML = '<h1 style="text-align:center; color: #d42e12; padding-top: 50px;">Error al verificar el carnet.</h1>';
    }
}
function displayVerifiedCarnet(data) {
    const carnetWrapper = document.getElementById("carnet-wrapper");
    const carnetHTML = `
      <div style="margin-top: 50px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
        <div style="border: 2px solid #000000; border-radius: 12px; padding: 16px; width: 428px; font-family: 'Poppins', Arial, sans-serif; background-color: #fdfdfd; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: auto;">
          <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">
            <img src="logo.png" alt="Logo Liga" style="max-width: 60px;">
            <h2 style="color: #004d00; margin: 4px 0; font-size: 14px; font-weight: 700;">LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${data.fotoUrl}" alt="Foto" style="width: 110px; height: 140px; object-fit: cover; border-radius: 8px;">
            <div style="font-size: 14px; flex-grow: 1;">
              <strong style="font-size: 18px; font-weight: 900; display: block;">${data.nombre}</strong>
              <span style="display: block; color: #555; margin-bottom: 8px;">${data.tipoDocumento} ${data.numeroDocumento}</span>
              <strong>Rol:</strong> ${data.rol}<br>
              <strong>Contacto Emer:</strong> ${data.contacto}<br>
              <strong>Sangre y RH:</strong> ${data.sangre}
            </div>
          </div>
        </div>
        <h3 style="text-align:center; color: #00843D;">✓ Carnet Válido y Verificado</h3>
      </div>
    `;
    carnetWrapper.innerHTML = carnetHTML;
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
            alert("Por favor completa el número de documento y selecciona una foto.");
            submitBtn.disabled = false;
            statusMessage.textContent = "";
            return;
        }
        try {
            statusMessage.textContent = "Subiendo foto...";
            const fotoPath = `fotos/${numeroDocumento}_${Date.now()}`;
            const storageRef = ref(storage, fotoPath);
            const snapshot = await uploadBytes(storageRef, fotoFile);
            const downloadURL = await getDownloadURL(snapshot.ref);
            const afiliadoData = {
                nombre: document.getElementById("nombre").value.toUpperCase(),
                tipoDocumento: document.getElementById("tipoDocumento").value,
                numeroDocumento: numeroDocumento,
                contacto: document.getElementById("contacto").value,
                sangre: document.getElementById("sangre").value.toUpperCase(),
                rol: document.getElementById("rol").value,
                fotoUrl: downloadURL,
                fechaRegistro: new Date().toISOString()
            };
            statusMessage.textContent = "Guardando información...";
            await setDoc(doc(db, "afiliados", numeroDocumento), afiliadoData);
            statusMessage.textContent = "¡Afiliado registrado con éxito!";
            statusMessage.style.color = "green";
            form.reset();
        } catch (error) {
            console.error("Error en el proceso de registro: ", error);
            statusMessage.textContent = `Error: No se pudo registrar. Revisa la consola para más detalles.`;
            statusMessage.style.color = "red";
        } finally {
            submitBtn.disabled = false;
        }
    });
}