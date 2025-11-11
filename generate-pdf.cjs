const fs = require('fs');
const path = require('path');
const { mdToPdf } = require('md-to-pdf');

async function generatePDF() {
  const mdFilePath = path.join(__dirname, 'DOCUMENTACION_MEDIA_ENHANCER.md');
  const pdfFilePath = path.join(__dirname, 'DOCUMENTACION_MEDIA_ENHANCER.pdf');

  console.log('📄 Generando PDF desde:', mdFilePath);

  try {
    // Verificar que el archivo MD existe
    if (!fs.existsSync(mdFilePath)) {
      console.error('❌ Error: No se encontró el archivo DOCUMENTACION_MEDIA_ENHANCER.md');
      process.exit(1);
    }

    // Generar PDF con configuración simple
    const pdf = await mdToPdf(
      { path: mdFilePath },
      {
        dest: pdfFilePath,
        pdf_options: {
          format: 'A4',
          margin: '20mm',
          printBackground: true,
        },
        stylesheet: path.join(__dirname, 'pdf-style.css')
      }
    );

    console.log('✅ PDF generado exitosamente:', pdfFilePath);
    console.log('📊 Tamaño:', (fs.statSync(pdfFilePath).size / 1024 / 1024).toFixed(2), 'MB');
  } catch (error) {
    console.error('❌ Error al generar PDF:', error.message);
    process.exit(1);
  }
}

generatePDF();
