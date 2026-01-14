import fs from 'fs/promises';
import path from 'path';

import { pdf2img } from '@pdfme/converter';

export const generateThumbnailFromPdf = async (pdfBuffer, outputPath) => {

}

export const generateThumbnailFromBuffer = async (pdfBuffer, outputPath) => {
  console.log("🎨 Generando miniatura con @pdfme/converter desde buffer... " + outputPath);

  try {
    // 1️⃣ Verificar que el buffer no esté vacío
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("El buffer del PDF está vacío");
    }

    // 2️⃣ Asegurar que el directorio de salida existe
    const fs = require('fs').promises;
    const path = require('path');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // 3️⃣ Convertir PDF a imágenes usando @pdfme/converter
    console.log(`📄 Convirtiendo PDF a miniatura (solo página 1)...`);
    
    // Convertir Buffer a ArrayBuffer si es necesario
    let arrayBuffer;
    if (pdfBuffer instanceof Buffer) {
      arrayBuffer = pdfBuffer.buffer.slice(
        pdfBuffer.byteOffset,
        pdfBuffer.byteOffset + pdfBuffer.byteLength
      );
    } else if (pdfBuffer instanceof ArrayBuffer) {
      arrayBuffer = pdfBuffer;
    } else if (pdfBuffer.buffer instanceof ArrayBuffer) {
      arrayBuffer = pdfBuffer.buffer;
    } else {
      throw new Error("Formato de buffer no soportado");
    }

    // Configurar opciones de conversión
    const images = await pdf2img(arrayBuffer, {
      imageType: 'png',
      scale: 1, // Escala 1 = tamaño original
      range: { 
        start: 0, // Primera página (índice 0)
        end: 0    // Solo la primera página
      },
    });

    // 4️⃣ Verificar que se generaron imágenes
    if (!images || images.length === 0) {
      throw new Error("No se generaron imágenes del PDF");
    }

    // 5️⃣ Guardar la primera imagen (página 1) como miniatura
    const firstImage = images[0];
    if (!firstImage) {
      throw new Error("No se pudo generar la imagen de la primera página");
    }

    // 6️⃣ Convertir base64 o buffer a archivo según lo que devuelva pdf2img
    let imageData;
    
    if (typeof firstImage === 'string') {
      // Si devuelve base64
      const base64Data = firstImage.replace(/^data:image\/png;base64,/, '');
      imageData = Buffer.from(base64Data, 'base64');
    } else if (firstImage instanceof Buffer) {
      // Si ya es un Buffer
      imageData = firstImage;
    } else if (firstImage.data && firstImage.data instanceof Uint8Array) {
      // Si es Uint8Array
      imageData = Buffer.from(firstImage.data);
    } else {
      // Intentar convertir lo que sea a Buffer
      imageData = Buffer.from(firstImage);
    }

    // 7️⃣ Guardar la imagen en el archivo de salida
    await fs.writeFile(outputPath, imageData);
    
    // 8️⃣ Verificar que el archivo se creó correctamente
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      throw new Error("La miniatura generada está vacía");
    }

    console.log(`✅ Miniatura creada correctamente: ${outputPath}`);
    
  } catch (err) {
    console.error("❌ Error generando miniatura desde buffer:", err);
    
    // Intentar crear una miniatura por defecto (manteniendo tu lógica original)
    try {
      await createFallbackThumbnail(outputPath);
      console.log("✅ Se creó miniatura por defecto");
    } catch (fallbackError) {
      console.error("❌ Error creando miniatura por defecto:", fallbackError);
    }
    
    throw err;
  }
};

// Función auxiliar para miniatura por defecto (mantén tu implementación actual)
async function createFallbackThumbnail(outputPath) {
  const fs = require('fs').promises;
  const path = require('path');
  
  // Asegurar que el directorio existe
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  
  // Aquí deberías implementar tu lógica para crear una miniatura por defecto
  // Por ejemplo, crear una imagen simple con texto o usar una imagen placeholder
  console.log("Creando miniatura por defecto...");
  
  // Si no tienes implementación, al menos crea un archivo vacío o maneja el error
  await fs.writeFile(outputPath, '').catch(() => {});
}