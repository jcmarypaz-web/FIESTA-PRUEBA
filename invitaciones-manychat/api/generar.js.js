const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const https = require('https');

// Función para descargar la fuente Quicksand (peso 600) al vuelo
function cargarFuente() {
  return new Promise((resolve, reject) => {
    const fontUrl = 'https://fonts.gstatic.com/s/quicksand/v31/6xKtdSZaM9iE8KbpRA_hK1QN.woff2';
    const req = https.get(fontUrl, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        GlobalFonts.register(buffer, 'Quicksand');
        resolve();
      });
    });
    req.on('error', reject);
  });
}

let fuenteCargada = false;

module.exports = async (req, res) => {
  try {
    // 1. Obtener el nombre de la URL (ej: /api/generar?nombre=Maria)
    const nombre = req.query.nombre || 'Invitada Especial';

    // 2. Cargar fuente si aún no está registrada
    if (!fuenteCargada) {
      await cargarFuente();
      fuenteCargada = true;
    }

    // 3. Crear canvas de 1080 x 1920
    const canvas = createCanvas(1080, 1920);
    const ctx = canvas.getContext('2d');

    // 4. Cargar la imagen de fondo
    const imagePath = path.join(process.cwd(), 'assets', 'fondo.png');
    const image = await loadImage(imagePath);
    ctx.drawImage(image, 0, 0, 1080, 1920);

    // 5. Estilar y dibujar el nombre
    ctx.font = '600 35px Quicksand';
    ctx.fillStyle = '#E77B97';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Posición X = 540, Y = 445
    ctx.fillText(nombre, 540, 445);

    // 6. Generar el buffer de la imagen PNG y enviarla
    const buffer = await canvas.toBuffer('image/png');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache para rendimiento
    return res.status(200).send(buffer);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al generar la invitación', details: error.message });
  }
};