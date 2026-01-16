import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

export const generateThumbnailFromPdf = async (pdfBuffer, outputPath) => {
  // Esta función puede ser un alias o implementar la misma lógica
  return generateThumbnailFromBuffer(pdfBuffer, outputPath);
}

export const generateThumbnailFromBuffer = async (pdfBuffer, outputPath) => {
  console.log("🎨 Generando miniatura con Puppeteer desde buffer... " + outputPath);

  let browser = null;
  
  try {
    // 1️⃣ Verificar que el buffer no esté vacío
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("El buffer del PDF está vacío");
    }

    // 2️⃣ Asegurar que el directorio de salida existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // 3️⃣ Convertir PDF a base64
    const pdfBase64 = pdfBuffer.toString('base64');

    // 4️⃣ Crear HTML con PDF.js para renderizar el PDF
    const html = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: white;
        }
        canvas {
            max-width: 100%;
            height: auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <canvas id="pdfCanvas"></canvas>
    <script src="https://unpkg.com/pdfjs-dist@3.7.107/build/pdf.min.js"></script>
    <script>
        async function renderPdf(base64) {
            try {
                // Decodificar base64 a Uint8Array
                const pdfData = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                
                // Configurar PDF.js
                const loadingTask = window.pdfjsLib.getDocument({ 
                    data: pdfData,
                    // Configuraciones para mejor rendimiento
                    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.7.107/cmaps/',
                    cMapPacked: true
                });
                
                const pdf = await loadingTask.promise;
                
                // Solo primera página
                const page = await pdf.getPage(1);
                
                // Calcular escala para miniatura (ajustar según necesidad)
                // Objetivo: aproximadamente 115px de ancho máximo
                const viewport = page.getViewport({ scale: 1 });
                const targetWidth = 115;
                const scale = targetWidth / viewport.width;
                
                const scaledViewport = page.getViewport({ scale });
                const canvas = document.getElementById('pdfCanvas');
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                
                const ctx = canvas.getContext('2d');
                
                // Configurar fondo blanco
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Renderizar página
                const renderContext = {
                    canvasContext: ctx,
                    viewport: scaledViewport,
                    // Mejorar calidad de renderizado
                    enableWebGL: false,
                    useCORS: true
                };
                
                await page.render(renderContext).promise;
                
                // Convertir a data URL
                return canvas.toDataURL('image/png', 0.9); // Calidad 90%
                
            } catch (error) {
                console.error('Error renderizando PDF:', error);
                throw error;
            }
        }
        
        window.renderPdfBase64 = renderPdf;
    </script>
</body>
</html>`;

    // 5️⃣ Iniciar Puppeteer
    console.log("🌐 Iniciando Puppeteer...");
    browser = await puppeteer.launch({
      headless: 'new', // Usar el nuevo headless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
      ],
      timeout: 30000 // 30 segundos timeout
    });

    const page = await browser.newPage();
    
    // Configurar timeout
    page.setDefaultTimeout(30000);
    
    // Configurar viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // 6️⃣ Cargar el HTML y ejecutar la conversión
    console.log("📄 Cargando y renderizando PDF...");
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Ejecutar la función de renderizado en el contexto de la página
    const dataUrl = await page.evaluate(async (base64) => {
      return await window.renderPdfBase64(base64);
    }, pdfBase64);

    // 7️⃣ Extraer y guardar la imagen
    if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
      throw new Error("No se pudo generar la imagen del PDF");
    }

    const matches = dataUrl.match(/^data:image\/png;base64,(.*)$/);
    if (!matches || !matches[1]) {
      throw new Error("Formato de imagen inválido");
    }

    const imageBase64 = matches[1];
    const imageData = Buffer.from(imageBase64, 'base64');

    // 8️⃣ Guardar la imagen
    await fs.writeFile(outputPath, imageData);
    
    // 9️⃣ Verificar que el archivo se creó correctamente
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      throw new Error("La miniatura generada está vacía");
    }

    console.log(`✅ Miniatura creada correctamente: ${outputPath} (${Math.round(stats.size / 1024)} KB)`);
    
  } catch (err) {
    console.error("❌ Error generando miniatura con Puppeteer:", err.message);
    
    // Intentar crear una miniatura por defecto
    try {
      await createFallbackThumbnail(outputPath);
      console.log("✅ Se creó miniatura por defecto");
    } catch (fallbackError) {
      console.error("❌ Error creando miniatura por defecto:", fallbackError);
    }
    
    throw err;
    
  } finally {
    // 🔟 Cerrar el navegador siempre
    if (browser) {
      try {
        await browser.close();
        console.log("🔒 Navegador cerrado");
      } catch (closeError) {
        console.error("Error cerrando el navegador:", closeError);
      }
    }
  }
};

// Función auxiliar para miniatura por defecto (mantén tu implementación actual)
async function createFallbackThumbnail(outputPath) {
  try {
    // Asegurar que el directorio existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    console.log("🔄 Creando miniatura por defecto...");
    
    // Si no tienes implementación, al menos crea un archivo vacío
    await fs.writeFile(outputPath, '').catch(() => {});
    
  } catch (error) {
    console.error("Error en fallback thumbnail:", error);
    throw error;
  }
}