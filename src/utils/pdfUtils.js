//src\controllers\templateController.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generate } from '@pdfme/generator';
import { text, multiVariableText, table, line, rectangle, ellipse, image, svg } from "@pdfme/schemas";
import { agregarImageSandbox } from '../pdfme/utils.js';
import { signature } from '../pdfme/plugins/signature/index.js';
import { PDFDocument } from 'pdf-lib'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../public/uploads/templates');
const tempDir = path.resolve(__dirname, '../../temp');


export async function handleGeneratePdf(res = null, template, jsonContent, returnBuffer = false) {
  const plugins = { text, multiVariableText, table, line, rectangle, ellipse, image, svg, signature };

  
  // Copia profunda del template
  let updatedTemplate = JSON.parse(JSON.stringify(template));

  // Configurar basePdf si es BLANK_PDF
  if (updatedTemplate.basePdf === 'BLANK_PDF') {
    updatedTemplate.basePdf = { width: 210, height: 297, padding: [0, 0, 0, 0] };
  }

   // Extraer width y height de basePdf si existen
  let width, height;
  if (updatedTemplate.basePdf && typeof updatedTemplate.basePdf === 'object') {
    width = updatedTemplate.basePdf.width;
    height = updatedTemplate.basePdf.height;
  }

  // Llamar a la función solo si existen width y height, de lo contrario usar valores por defecto
  if (width !== undefined && height !== undefined) {
    updatedTemplate = agregarImageSandbox(updatedTemplate, width - 10, height - 10);
  } else {
    updatedTemplate = agregarImageSandbox(updatedTemplate);
  }

  // === PROCESAR JSON CONTENT ===
  // Actualiza los schemas con el JSON en los campos "multiVariableText" y "table"
  if (jsonContent) {
    updatedTemplate.schemas = updatedTemplate.schemas.map(schema =>
      schema.map(field => {
        // Procesamiento para campos de tipo "multiVariableText"
        if (field.type === "multiVariableText" && field.content) {
          try {
            // Parsear el contenido actual
            const contentObj = JSON.parse(field.content);
            
            // Actualizar solo las propiedades que existen en el contentObj
            const updatedContent = {};
            for (const key in contentObj) {
              if (jsonContent.hasOwnProperty(key)) {
                if (jsonContent[key] != "") {
                  updatedContent[key] = jsonContent[key];
                } else {
                  updatedContent[key] = " ";
                }
              } else {
                updatedContent[key] = " ";
              }
            }
            
            // Actualizar el campo con el nuevo contenido
            return {
              ...field,
              content: JSON.stringify(updatedContent)
            };
          } catch (e) {
            console.error(`Error parsing content for field ${field.name}:`, e);
            return field; // Si hay error, devolver el campo sin cambios
          }
        }

        // Procesamiento para campos de tipo "table"
        if (field.type === "table" && jsonContent.detalles) {
          try {
            // Extraer TODOS los valores de cada objeto en detalles (en el orden original)
            const tableData = jsonContent.detalles.map(item => {
              return Object.values(item).map(value => value || " "); // Si es null/undefined → " "
            });

            return {
              ...field,
              content: JSON.stringify(tableData)
            };
          } catch (e) {
            console.error(`Error processing table data for field ${field.name}:`, e);
            return field;
          }
        }

        return field;
      })
    );
  }
  
  const fonts = await initializeFonts()

  // Generar el PDF
  const pdf = await generate({
    template: updatedTemplate,
    plugins,
    inputs: [updatedTemplate.schemas.flat().reduce((acc, field) => {
      acc[field.name] = field.content || '';
      return acc;
    }, {})],
    options: { lang: 'es', font: fonts},
  });

  const pdfBuffer = Buffer.from(pdf.buffer);

  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    pdfDoc.setTitle('Documento');
    pdfDoc.setAuthor('GDD 1.0');
    pdfDoc.setSubject('Facturación digital');
    pdfDoc.setProducer('Soluciones Laser C.A');
    pdfDoc.setCreator('GDD 1.0');
    pdfDoc.setKeywords(['PDF', 'Generación', 'Metadatos', 'Documento', 'Digital', 'GDD']);
    
    const pdfBytes = await pdfDoc.save();
    const modifiedPdfBuffer = Buffer.from(pdfBytes);
    
    // Usar el buffer modificado en lugar del original
    const finalPdfBuffer = modifiedPdfBuffer;

    // Manejar diferentes modos de retorno
    if (returnBuffer) {
      return { buffer: finalPdfBuffer };
    } else if (res == null) {
      await fs.mkdir(tempDir, { recursive: true });
      const pdfFilePath = path.join(tempDir, `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
      await fs.writeFile(pdfFilePath, finalPdfBuffer);
      return { filePath: pdfFilePath };
    } else if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
      res.send(finalPdfBuffer);
    }
  } catch (error) {
    console.error('Error modificando metadatos del PDF:', error);
    // En caso de error, usar el buffer original
    if (returnBuffer) {
      return { buffer: pdfBuffer };
    } else if (res == null) {
      await fs.mkdir(tempDir, { recursive: true });
      const pdfFilePath = path.join(tempDir, `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`);
      await fs.writeFile(pdfFilePath, pdfBuffer);
      return { filePath: pdfFilePath };
    } else if (res) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=generated.pdf');
      res.send(pdfBuffer);
    }
  }
}

export async function extraerVariablesDesdeTemplate(templateJson) {
  const resultado = {};

  // El template posee "schemas" que es un array de arrays
  // Debemos recorrer cada nivel
  templateJson.schemas.forEach(schemaArray => {
    schemaArray.forEach(item => {
      if (Array.isArray(item.variables) && item.variables.length > 0) {
        // Parsear el content si es un JSON válido
        let contentParsed = {};
        try {
          contentParsed = JSON.parse(item.content || "{}");
        } catch (err) {
          contentParsed = {};
        }

        // Agregar cada variable al JSON resultante
        item.variables.forEach(variable => {
          resultado[variable] = contentParsed[variable] ?? "";
        });
      }
    });
  });

  return resultado;
}

export function extraerNombresDesdeTemplate(templateJson) {
  return templateJson.schemas?.flat().map(item => item?.name).filter(Boolean) || [];
}

const loadFont = async (filePath) => {
  return await fs.readFile(filePath)
}

export const initializeFonts = async () => {
  // Cambia esta línea:
  // const basePath = path.join(__dirname, '../../public/fonts')
  
  // Por esta (sube solo un nivel desde controllers):
  const basePath = path.join(__dirname, '../public/fonts')
  
  // O si eso no funciona, prueba con:
  // const basePath = path.join(process.cwd(), 'src/public/fonts')

  const focoRegular = await loadFont(path.join(basePath, 'Foco/Foco_Trial_Rg.ttf'))
  const focoBold = await loadFont(path.join(basePath, 'Foco/Foco_Trial_Bd.ttf'))
  const focoItalic = await loadFont(path.join(basePath, 'Foco/Foco_Trial_It.ttf'))
  const focoBoldItalic = await loadFont(path.join(basePath, 'Foco/Foco_Trial_BdIt.ttf'))
  const focoLight = await loadFont(path.join(basePath, 'Foco/Foco_Trial_Lt.ttf'))
  const focoLightItalic = await loadFont(path.join(basePath, 'Foco/Foco_Trial_LtIt.ttf'))
  const focoBlack = await loadFont(path.join(basePath, 'Foco/Foco_Trial_Blk.ttf'))
  const focoBlackItalic = await loadFont(path.join(basePath, 'Foco/Foco_Trial_BlkIt.ttf'))

  const robotoRegular = await loadFont(path.join(basePath, 'Roboto/Roboto-Regular.ttf'))
  const robotoBold = await loadFont(path.join(basePath, 'Roboto/Roboto-Bold.ttf'))
  const robotoItalic = await loadFont(path.join(basePath, 'Roboto/Roboto-Italic.ttf'))

  return {
    Roboto: {
      data: robotoRegular,
      fallback: true,
    },
    'Roboto-Bold': {
      data: robotoBold,
      fallback: false,
    },
    'Roboto-Italic': {
      data: robotoItalic,
      fallback: false,
    },
    'Foco-Regular': {
      data: focoRegular,
      fallback: false,
    },
    'Foco-Bold': {
      data: focoBold,
      fallback: false,
    },
    'Foco-Italic': {
      data: focoItalic,
      fallback: false,
    },
    'Foco-BoldItalic': {
      data: focoBoldItalic,
      fallback: false,
    },
    'Foco-Light': {
      data: focoLight,
      fallback: false,
    },
    'Foco-LightItalic': {
      data: focoLightItalic,
      fallback: false,
    },
    'Foco-Black': {
      data: focoBlack,
      fallback: false,
    },
    'Foco-BlackItalic': {
      data: focoBlackItalic,
      fallback: false,
    },
  }
}

/**
* Comprime un objeto JSON usando gzip y lo convierte a Blob
* @param data - Objeto a comprimir
* @returns Blob comprimido con gzip
*/
export async function compressJson(data) {
  const jsonString = JSON.stringify(data)
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(jsonString))
      controller.close()
    }
  })
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"))
  return await new Response(compressedStream).blob()
}

/**
* Descomprime un ArrayBuffer gzip y lo convierte a objeto JSON
* @param arrayBuffer - ArrayBuffer comprimido con gzip
* @returns Objeto JSON descomprimido
*/
export async function decompressJson(arrayBuffer) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(arrayBuffer))
      controller.close()
    }
  }).pipeThrough(new DecompressionStream("gzip"))

  const text = await new Response(stream).text()
  return JSON.parse(text)
}

/**
* Descomprime un Blob gzip y lo convierte a objeto JSON
* @param blob - Blob comprimido con gzip
* @returns Objeto JSON descomprimido
*/
export async function decompressJsonFromBlob(blob) {
  const arrayBuffer = await blob.arrayBuffer()
  return decompressJson(arrayBuffer)
}