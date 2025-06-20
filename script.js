document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("carnet-form");
  const carnetWrapper = document.getElementById("carnet-wrapper");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let rolDisplay = document.getElementById("rol").value;
    if (rolDisplay === "Otro") {
      rolDisplay = document.getElementById("otroRol").value || "ROL NO ESPECIFICADO";
    }
    if (rolDisplay === "Entrenador") {
        const tipoEntrenador = document.getElementById("tipoEntrenador").value;
        rolDisplay += ` (${tipoEntrenador})`;
        if (tipoEntrenador === 'Alto Rendimiento') {
            rolDisplay += ` - ${document.getElementById("estiloLucha").value}`;
        }
    }
    
    const nombre = document.getElementById("nombre").value.toUpperCase();
    const tipoDocumento = document.getElementById("tipoDocumento").value;
    const numeroDocumento = document.getElementById("numeroDocumento").value;
    const contacto = document.getElementById("contacto").value;
    const sangre = document.getElementById("sangre").value.toUpperCase();
    const fotoURL = document.getElementById("foto").files[0];

    if (!fotoURL) { alert("Por favor selecciona una foto."); return; }

    const reader = new FileReader();
    reader.onload = function (e) {
      const fotoBase64 = e.target.result;

      // --- NUEVA ESTRUCTURA HTML DEL CARNET BASADA EN TU CSS ---
      const carnetHTML = `
        <div class="carnet-contenedor" id="carnet-a-descargar">
            <div class="carnet-header">
                <img src="logo.png" class="logo" alt="Logo">
                <h2>LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
            </div>
            <div class="carnet-body">
                <img src="${fotoBase64}" class="foto" alt="Foto">
                <div class="contenido">
                    <div class="texto">
                        <p><strong>${nombre}</strong></p>
                        <p>${tipoDocumento} ${numeroDocumento}</p>
                        <p>Rol: ${rolDisplay}</p>
                        <p>Sangre: ${sangre}</p>
                        <p>Emergencia: ${contacto}</p>
                    </div>
                </div>
            </div>
            <div class="qr" id="qr-code-container"></div>
        </div>
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #c40000; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Descargar Carnet</button>
      `;

      carnetWrapper.innerHTML = carnetHTML;

      const qrCodeContainer = document.getElementById("qr-code-container");
      new QRCode(qrCodeContainer, {
        text: `${nombre} - ${numeroDocumento}`, // El QR ahora contiene datos básicos
        width: 50,
        height: 50,
      });
    };

    reader.readAsDataURL(fotoURL);
  });
});