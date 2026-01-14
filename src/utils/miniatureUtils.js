import fs from 'fs/promises';
import path from 'path';

import pdf from "pdf-poppler";
import os from "os";


// -------------------------------
// ✅ FUNCIÓN: GENERAR MINIATURA (pdf-poppler)
// -------------------------------
export const generateThumbnailFromPdf = async (pdfFilePath, outputPath) => {
  console.log('🎨 Generando miniatura con pdf-poppler...');
  try {
    const opts = {
      format: "png",
      out_dir: path.dirname(outputPath),
      out_prefix: path.basename(outputPath, ".png"),
      page: 1,
    };

    await pdf.convert(pdfFilePath, opts);

    const generatedFile = path.join(
      path.dirname(outputPath),
      `${path.basename(outputPath, ".png")}-1.png`
    );

    await fs.rename(generatedFile, outputPath);
    console.log(`✅ Miniatura creada correctamente: ${outputPath}`);
  } catch (err) {
    console.error('❌ Error generando miniatura:', err);
    throw err;
  }
};

export const generateThumbnailFromBuffer = async (pdfBuffer, outputPath) => {
  console.log("🎨 Generando miniatura con pdf-poppler desde buffer... "+ outputPath);

  // Crear un archivo PDF temporal
  const tempPdfPath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);

  try {
    // 1️⃣ Verificar que el buffer no esté vacío
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("El buffer del PDF está vacío");
    }

    // 2️⃣ Guardar el buffer temporalmente
    await fs.writeFile(tempPdfPath, pdfBuffer);
    
    // 3️⃣ Verificar que el archivo PDF se haya creado correctamente
    const stats = await fs.stat(tempPdfPath);
    if (stats.size === 0) {
      throw new Error("El archivo PDF temporal está vacío");
    }

    // 4️⃣ Configuración para pdf-poppler
    const opts = {
      format: "png",
      out_dir: path.dirname(outputPath),
      out_prefix: path.basename(outputPath, ".png"),
      page: 1, // Convertir solo la página 1
    };

    // 5️⃣ Asegurar que el directorio de salida existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // 6️⃣ Convertir PDF a PNG
    console.log(`📄 Convirtiendo PDF a miniatura (solo página 1)...`);
    await pdf.convert(tempPdfPath, opts);

    // 7️⃣ BUSCAR EL ARCHIVO CON DIFERENTES PATRONES DE NOMBRE
    // pdf-poppler puede generar: "-1.png", "-01.png", "-001.png", etc.
    const baseName = path.basename(outputPath, ".png");
    const dirName = path.dirname(outputPath);
    
    let generatedFile = null;
    const possiblePatterns = [
      `${baseName}-1.png`,    // Patrón común
      `${baseName}-01.png`,   // Con 2 dígitos (lo que está pasando)
      `${baseName}-001.png`,  // Con 3 dígitos
      `${baseName}-0001.png`, // Con 4 dígitos
    ];

    console.log(`🔍 Buscando archivo generado con posibles patrones...`);
    
    // Buscar el archivo generado
    for (const pattern of possiblePatterns) {
      const filePath = path.join(dirName, pattern);
      try {
        await fs.access(filePath);
        generatedFile = filePath;
        console.log(`✅ Encontrado: ${pattern}`);
        break;
      } catch (err) {
        // Continuar con el siguiente patrón
      }
    }

    // 8️⃣ Si no encontramos con los patrones, buscar cualquier archivo que coincida
    if (!generatedFile) {
      console.log(`🔍 Escaneando directorio para archivos PNG...`);
      const files = await fs.readdir(dirName);
      
      // Buscar archivos que comiencen con el baseName
      for (const file of files) {
        if (file.startsWith(baseName) && file.endsWith('.png') && file !== path.basename(outputPath)) {
          generatedFile = path.join(dirName, file);
          console.log(`✅ Encontrado archivo alternativo: ${file}`);
          break;
        }
      }
    }

    // 9️⃣ Si aún no encontramos, lanzar error
    if (!generatedFile) {
      throw new Error(`No se encontró ningún archivo PNG generado por pdf-poppler en: ${dirName}`);
    }

    // 🔟 Renombrar a la ruta final deseada
    await fs.rename(generatedFile, outputPath);

    console.log(`✅ Miniatura creada correctamente: ${outputPath}`);
    
  } catch (err) {
    console.error("❌ Error generando miniatura desde buffer:", err);
    
    // Intentar crear una miniatura por defecto
    try {
      await createFallbackThumbnail(outputPath);
      console.log("✅ Se creó miniatura por defecto");
    } catch (fallbackError) {
      console.error("❌ Error creando miniatura por defecto:", fallbackError);
    }
    
    throw err;
  } finally {
    // Eliminar el archivo PDF temporal
    try {
      await fs.unlink(tempPdfPath).catch(() => {});
    } catch {
      /* ignorar errores de limpieza */
    }
  }
};