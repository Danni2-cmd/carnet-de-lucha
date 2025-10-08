document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registro-form');
    const carnetContainer = document.getElementById('carnet-container');
    const carnetVirtual = document.getElementById('carnet-virtual');
    const qrCodeContainer = document.getElementById('carnet-qr');
    let qrCodeInstance = null;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const nombres = document.getElementById('nombres').value.toUpperCase();
        const tipoDoc = document.getElementById('tipoDoc').value;
        const numDoc = document.getElementById('numDoc').value;
        const emergencia = document.getElementById('emergencia').value;
        const sangre = document.getElementById('sangre').value.toUpperCase();
        const rol = document.getElementById('rol').value;
        const fotoInput = document.getElementById('foto');

        // Manejar la foto localmente
        if (fotoInput.files && fotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('carnet-foto').src = e.target.result;
            };
            reader.readAsDataURL(fotoInput.files[0]);
        }

        // Poblar el carnet con los datos
        document.getElementById('carnet-nombres').innerText = nombres;
        document.getElementById('carnet-rol').innerText = rol.toUpperCase();
        document.getElementById('carnet-doc').innerText = `${tipoDoc} ${numDoc}`;
        document.getElementById('carnet-sangre').innerText = `RH: ${sangre}`;
        document.getElementById('carnet-emergencia').innerText = emergencia;

        // Aplicar color según el rol
        carnetVirtual.dataset.rol = rol.toLowerCase();

        // Generar QR
        const verificationUrl = `${window.location.href.split('?')[0]}?id=${numDoc}`;
        if (qrCodeInstance) { qrCodeContainer.innerHTML = ''; }
        qrCodeInstance = new QRCode(qrCodeContainer, {
            text: verificationUrl, width: 128, height: 128
        });
        
        // Mostrar el carnet
        carnetContainer.style.display = 'flex';
    });

    // Lógica para descargar el PDF con html2pdf.js
    document.getElementById('descargar-pdf').addEventListener('click', () => {
        const nombreArchivo = `Carnet_${document.getElementById('nombres').value.replace(/\s+/g, '_')}.pdf`;
        const carnetElement = document.getElementById('carnet-virtual');
        
        const opt = {
          margin:       0,
          filename:     nombreArchivo,
          image:        { type: 'jpeg', quality: 1.0 },
          html2canvas:  { scale: 4, useCORS: true },
          jsPDF:        { unit: 'mm', format: [85.6, 54], orientation: 'landscape' }
        };

        html2pdf().from(carnetElement).set(opt).save();
    });
});
