document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("carnet-form");
  const carnetContainer = document.getElementById("carnet-container");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const tipoDocumento = document.getElementById("tipoDocumento").value;
    const numeroDocumento = document.getElementById("numeroDocumento").value;
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

      // Se usa un div vacío para el QR que llenaremos con la librería local
      const carnetHTML = `
        <div id="carnet-a-descargar" style="border: 1px solid #ddd; border-radius: 12px; padding: 16px; width: 428px; font-family: 'Poppins', Arial, sans-serif; background-color: #fdfdfd; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px;">
            <img src="logo.png" alt="Logo Liga" style="max-width: 60px;">
            <h2 style="color: #004d00; margin: 4px 0; font-size: 14px; font-weight: 700;">LIGA SANTANDEREANA DE LUCHA OLÍMPICA</h2>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${fotoBase64}" alt="Foto" style="width: 110px; height: 140px; object-fit: cover; border-radius: 8px;">
            <div style="font-size: 14px; flex-grow: 1;">
              <strong style="font-size: 18px; font-weight: 900; display: block;">${nombre}</strong>
              <span style="display: block; color: #555; margin-bottom: 8px;">${tipoDocumento} ${numeroDocumento}</span>
              <strong>Rol:</strong> ${rol}${rol === "Administrativo" ? ` - ${cargo}` : ""}<br>
              <strong>Contacto Emer:</strong> ${contacto}<br>
              <strong>Sangre y RH:</strong> ${sangre}
            </div>
            <div id="qr-code-container" style="width: 80px; height: 80px; align-self: flex-end;"></div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <button id="descargar-btn" style="padding: 12px 25px; background-color: #d42e12; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">Descargar Carnet en PDF</button>
        </div>
      `;

      carnetContainer.innerHTML = carnetHTML;

      // --- Generar QR con la librería local (más fiable) ---
      const qrCodeContainer = document.getElementById("qr-code-container");
      const verificationUrl = window.location.href; // O tu URL de verificación
      new QRCode(qrCodeContainer, {
        text: verificationUrl,
        width: 80,
        height: 80,
      });

      // --- Lógica de descarga Anti-PDF en Blanco ---
      document.getElementById("descargar-btn").addEventListener("click", function () {
        const carnetElement = document.getElementById("carnet-a-descargar");
        
        // --- CÓDIGO CLAVE: ESPERAR A QUE LAS IMÁGENES CARGUEN ---
        const images = carnetElement.getElementsByTagName('img');
        const promises = [];
        for (let i = 0; i < images.length; i++) {
            if (images[i].complete) { // Si la imagen ya está cargada, no hacemos nada
                continue;
            }
            // Si no, creamos una promesa que se resolverá cuando la imagen cargue
            promises.push(new Promise(resolve => {
                images[i].onload = resolve;
                images[i].onerror = resolve; // Resolvemos también en error para no bloquear el proceso
            }));
        }

        // Promise.all espera a que todas las promesas de imágenes se cumplan
        Promise.all(promises).then(() => {
            console.log("Todas las imágenes están cargadas. Generando PDF...");
            
            const opt = {
                margin: 0,
                filename: `carnet_${numeroDocumento}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { scale: 4, useCORS: true }, // useCORS es buena práctica
                jsPDF: { unit: 'mm', format: [85.6, 53.98], orientation: 'landscape' }
            };
            
            // Ahora sí, generamos el PDF con la seguridad de que todo está visible
            html2pdf().from(carnetElement).set(opt).save();
        });
      });
    };

    reader.readAsDataURL(fotoURL);
  });
});
