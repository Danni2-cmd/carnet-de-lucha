// Espera a que cargue todo el DOM
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("carnet-form");
  const carnetContainer = document.getElementById("carnet-container");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Datos del formulario
    const nombre = document.getElementById("nombre").value;
    const documento = document.getElementById("documento").value;
    const contacto = document.getElementById("contacto").value;
    const sangre = document.getElementById("sangre").value;
    const rol = document.getElementById("rol").value;
    const cargo = document.getElementById("cargo").value;
    const fotoURL = document.getElementById("foto").files[0];

    if (!fotoURL) {
      alert("Por favor selecciona una foto.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const fotoBase64 = e.target.result;

      // Creamos el carnet con HTML
      const carnetHTML = `
        <div id="carnet" style="border: 2px solid #004d00; border-radius: 12px; padding: 16px; max-width: 400px; font-family: Arial, sans-serif; background-color: #fdfdfd;">
          <div style="text-align: center;">
            <img src="logo.png" alt="Logo Liga" style="max-width: 120px; margin-bottom: 8px;">
            <h2 style="color: #007700; margin: 4px 0;">LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
            <h3 style="color: #004d00;">Carnet Digital</h3>
          </div>
          <div style="display: flex; align-items: center; margin-top: 10px;">
            <img src="${fotoBase64}" alt="Foto" style="width: 100px; height: 120px; object-fit: cover; border-radius: 8px; margin-right: 16px; border: 1px solid #ccc;">
            <div style="font-size: 14px;">
              <strong>${nombre}</strong><br>
              CC: ${documento}<br>
              Contacto: ${contacto}<br>
              Sangre: ${sangre}<br>
              Rol: ${rol}${rol === "Administrativo" ? ` - ${cargo}` : ""}
            </div>
          </div>
          <div style="text-align: right; margin-top: 10px;">
            <img id="qr-code" alt="QR Code" style="width: 80px;">
          </div>
          <div style="text-align: center; margin-top: 15px;">
            <button onclick="descargarPDF()" style="padding: 8px 16px; background-color: #007700; color: white; border: none; border-radius: 4px;">Descargar carnet en PDF</button>
          </div>
        </div>
      `;

      carnetContainer.innerHTML = carnetHTML;

      // Generar QR del carnet
      const qrCodeImg = document.getElementById("qr-code");
      const dataURL = window.location.href;
      qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(dataURL)}&size=100x100`;

    };

    reader.readAsDataURL(fotoURL);
  });
});

// Descarga PDF usando html2pdf
function descargarPDF() {
  const carnet = document.getElementById("carnet");
  const opt = {
    margin: 0,
    filename: 'carnet_digital.pdf',
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { scale: 4 }, // Aumenta la escala para mayor calidad
    jsPDF: { 
      unit: 'mm', 
      format: [85.6, 53.98], // Tamaño exacto de tarjeta de crédito
      orientation: 'landscape' // Orientación horizontal
    }
  };
  html2pdf().from(carnet).set(opt).save();
}