document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registroForm');
    const carnetContainer = document.getElementById('carnet-container');
    const carnetVirtual = document.getElementById('carnet-virtual');
    const qrCodeContainer = document.getElementById('carnet-qr');
    let qrCodeInstance = null; 

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const nombres = document.getElementById('nombres').value.toUpperCase();
        const tipoDoc = document.getElementById('tipoDoc').value;
        const numDoc = document.getElementById('numDoc').value;
        const telEmergencia = document.getElementById('telEmergencia').value;
        const tipoSangre = document.getElementById('tipoSangre').value.toUpperCase();
        const rol = document.getElementById('rol').value.toUpperCase();
        const fotoInput = document.getElementById('foto');

        if (fotoInput.files && fotoInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('carnet-foto').src = e.target.result;
            };
            reader.readAsDataURL(fotoInput.files[0]);
        }

        document.getElementById('carnet-nombres').innerText = nombres;
        document.getElementById('carnet-rol').innerText = rol;
        document.getElementById('carnet-doc').innerText = `${tipoDoc} ${numDoc}`;
        document.getElementById('carnet-sangre').innerText = tipoSangre;
        document.getElementById('carnet-tel').innerText = telEmergencia;

        const verificationUrl = `https://danni2-cmd.github.io/carnet-de-lucha/index.html#verificar?id=${numDoc}`;
        
        if (qrCodeInstance) {
            qrCodeContainer.innerHTML = '';
        }

        qrCodeInstance = new QRCode(qrCodeContainer, {
            text: verificationUrl,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        carnetContainer.style.display = 'block';
    });

    document.getElementById('descargar-pdf').addEventListener('click', () => {
        const numDoc = document.getElementById('numDoc').value;
        const fileName = `Carnet_Lucha_${numDoc}.pdf`;

        const options = {
            scale: 4,
            useCORS: true,
            backgroundColor: '#ffffff'
        };

        html2canvas(carnetVirtual, options).then(canvas => {
            const cardWidthMM = 85.60;
            const cardHeightMM = 53.98;
            
            const pdf = new jspdf.jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [cardWidthMM, cardHeightMM]
            });

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, cardWidthMM, cardHeightMM);
            pdf.save(fileName);
        });
    });
});