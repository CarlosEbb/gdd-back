//src\controllers\templateController.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generate } from '@pdfme/generator';
import { text, multiVariableText, table, line, rectangle, ellipse, image, svg } from "@pdfme/schemas";

import { signature } from '../pdfme/plugins/signature/index.js';
import Template from '../models/templateModel.js';
import Version from '../models/versionModel.js';
import Category from '../models/categoryModel.js';
import Workspace from '../models/workspaceModel.js';
import { handleGeneratePdf, extraerVariablesDesdeTemplate} from '../utils/pdfUtils.js';
import geminiService from '../services/geminiService.js';

import { createJSONResponse } from '../utils/responseUtils.js';
import { generateThumbnailFromPdf, generateThumbnailFromBuffer } from '../utils/miniatureUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesDir = path.resolve(__dirname, '../public/uploads/templates');
const tempDir = path.resolve(__dirname, '../../temp');

// 🔹 Variable de entorno: modo de generación de miniatura
const THUMBNAIL_MODE = process.env.THUMBNAIL_MODE || "buffer";

export const getAllUserTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || null; // límite por defecto: 20
    const offset = parseInt(req.query.offset, 10) || null; // para paginación opcional

    // Nueva consulta combinada en el modelo
    const templatesWithVersions = await Template.getAllActiveByUser(userId, limit, offset);

    if (!templatesWithVersions.length) {
      return res.status(200).json(createJSONResponse(200, 'No se encontraron templates para este usuario', []));
    }

    res.json(createJSONResponse(200, 'Templates obtenidos correctamente', templatesWithVersions));
  } catch (error) {
    console.error('❌ Error en getAllUserTemplates:', error);
    res.status(500).json(createJSONResponse(500, 'Error al obtener los templates', { error: error.message }));
  }
};

export const getTemplates = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaceUuid = req.params.uuid_workspace;

    const workspace = await Workspace.findByUUID(workspaceUuid);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const hasAccess = await Workspace.userHasAccess(userId, workspace.id);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes acceso a este workspace'));
    }

    const templates = await Template.getActiveWithLastVersionByWorkspace(workspace.id);

    res.json(createJSONResponse(200, 'Templates activos del workspace', templates));
  } catch (error) {
    console.error('❌ Error en getTemplates:', error);
    res.status(500).json(createJSONResponse(500, 'Error al obtener templates'));
  }
};

// Definir tamaños de papel
const PAPER_SIZES = {
  CARTA: { width: 215.9, height: 279.4 },
  LEGAL: { width: 215.9, height: 355.6 },
  INFORME: { width: 139.7, height: 215.9 },
  EJECUTIVO: { width: 184.2, height: 266.7 },
  A5: { width: 148, height: 210 },
  B5: { width: 182, height: 257 },
  A4: { width: 210, height: 297 },
  FICHA: { width: 76.2, height: 127 }
};

// Definir márgenes predefinidos
const MARGIN_PRESETS = {
  NONE: { top: 0, bottom: 0, left: 0, right: 0 }, 
  NORMAL: { top: 25, bottom: 25, left: 30, right: 30 }, // 2.5cm, 2.5cm, 3cm, 3cm
  ESTRECHO: { top: 12.7, bottom: 12.7, left: 12.7, right: 12.7 }, // 1.27cm
  MODERADO: { top: 25.4, bottom: 25.4, left: 19.1, right: 19.1 }, // 2.54cm, 2.54cm, 1.91cm, 1.91cm
  ANCHO: { top: 25.4, bottom: 25.4, left: 50.8, right: 50.8 } // 2.54cm, 2.54cm, 5.08cm, 5.08cm
};

// Opcional: Función helper para obtener dimensiones con márgenes
function getPaperConfig(pageSize, orientation = 'PORTRAIT', marginType = 'NONE') {
  // Obtener dimensiones del papel
  const size = PAPER_SIZES[pageSize.toUpperCase()] || PAPER_SIZES.CARTA;
  
  // Obtener márgenes
  const margins = MARGIN_PRESETS[marginType.toUpperCase()] || MARGIN_PRESETS.NONE;
  console.log(margins);
  // Aplicar orientación si es landscape (intercambiar width/height)
  let width = size.width;
  let height = size.height;
  
  if (orientation.toUpperCase() === 'LANDSCAPE') {
    width = size.height;
    height = size.width;
  }
  
  return {
    width,
    height,
    margins: {
      top: margins.top,
      bottom: margins.bottom,
      left: margins.left,
      right: margins.right
    }
  };
}

export const createTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      name, 
      description, 
      uuid_workspace,
      uuid_category, // Nuevo campo opcional
      pageSize = 'CARTA', 
      orientation = 'PORTRAIT', 
      marginType = 'NONE',
      prompt
    } = req.body;

    const validPageSizes = ['CARTA', 'LEGAL', 'INFORME', 'EJECUTIVO', 'A5', 'B5', 'A4', 'FICHA'];
    const validOrientations = ['PORTRAIT', 'LANDSCAPE'];
    const validMarginTypes = ['NONE' ,'NORMAL', 'ESTRECHO', 'MODERADO', 'ANCHO'];
    
    if (pageSize && !validPageSizes.includes(pageSize.toUpperCase())) {
      return res.status(400).json(createJSONResponse(400, 'Tamaño de hoja no válido'));
    }
    
    if (orientation && !validOrientations.includes(orientation.toUpperCase())) {
      return res.status(400).json(createJSONResponse(400, 'Orientación no válida'));
    }
    
    if (marginType && !validMarginTypes.includes(marginType.toUpperCase())) {
      return res.status(400).json(createJSONResponse(400, 'Tipo de margen no válido'));
    }

    const workspace = await Workspace.findByUUID(uuid_workspace);
    if (!workspace) {
      return res.status(404).json(createJSONResponse(404, 'Workspace no encontrado'));
    }

    const hasAccess = await Workspace.userHasAccess(userId, workspace.id);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes acceso al workspace'));
    }

    // Variable para almacenar la plantilla base
    let baseTemplate = null;
    let categoryInfo = null;

    // REGLA: Si hay uuid_category, usarla (ignorar prompt si existe)
    if (uuid_category) {
      categoryInfo = await Category.findByUUID(uuid_category);

      if (!categoryInfo) {
        return res.status(404).json(createJSONResponse(404, 'Categoría no encontrada'));
      }

      try {
        // Construir la ruta completa al archivo JSON de la categoría
        const categoryJsonPath = path.resolve(`./src/public${categoryInfo.path_json}`);
        // Verificar si el archivo existe
        if (await fs.access(categoryJsonPath).then(() => true).catch(() => false)) {
          // Leer el archivo JSON de la categoría
          const categoryJsonContent = await fs.readFile(categoryJsonPath, 'utf8');
          baseTemplate = JSON.parse(categoryJsonContent);
          
          console.log(`📁 Plantilla base cargada desde categoría: ${categoryInfo.title}`);
        } else {
          console.warn(`⚠️ Archivo JSON de categoría no encontrado: ${categoryJsonPath}`);
          // Continuar sin template base si el archivo no existe
        }
      } catch (error) {
        console.error('❌ Error al cargar plantilla de categoría:', error);
        // Continuar sin template base si hay error
      }
    }
    // Si NO hay categoría pero SÍ hay prompt, usar Gemini
    else if (prompt && prompt != '') {
      console.log('🤖 Generando template con Gemini...');
      try {
        baseTemplate = await geminiService.generatePDFMESchema(prompt);
        console.log('✅ Template generado con Gemini');
        
        // Validar que sea un objeto válido
        if (!baseTemplate || typeof baseTemplate !== 'object') {
          console.error('❌ Gemini no devolvió un JSON válido');
          baseTemplate = null; // Usar template por defecto
        }
      } catch (error) {
        console.error('❌ Error al generar template con Gemini:', error);
        // Continuar sin template base si hay error
      }
    }

    const template = await Template.create({
      title,
      name,
      description,
      id_workspace: workspace.id,
      page_size: pageSize, 
      orientation: orientation,
      margin_type: marginType,
      id_category: categoryInfo ? categoryInfo.id : null // Opcional: almacenar referencia a categoría
    });

    const buildNumber = 1.00;
    const name_version = '1.00';
    const safeBuild = name_version.replace('.', '_');
    const baseName = `u${userId}-w${workspace.id}-t${template.id}-v${safeBuild}`;
    const path_json = path.join(templatesDir, `${baseName}.json`);
    const path_thumbnails = `/thumbnails/${baseName}.png`;

    await fs.mkdir(templatesDir, { recursive: true });
    
    // Obtener configuración completa (dimensiones + márgenes)
    const paperConfig = getPaperConfig(pageSize, orientation, marginType);
    
    let finalTemplate;
    
    if (baseTemplate) {
      // Usar la plantilla base (de categoría o de Gemini)
      finalTemplate = baseTemplate;
      
    } else {
      // Crear template por defecto
      finalTemplate = {
        schemas: [[]],
        basePdf: { 
          width: paperConfig.width, 
          height: paperConfig.height, 
          padding: [
            paperConfig.margins.left,
            paperConfig.margins.top,
            paperConfig.margins.right,
            paperConfig.margins.bottom
          ]
        },
        pdfmeVersion: "5.4.6"
      };
    }
    
    // Guardar el template final
    await fs.writeFile(path_json, JSON.stringify(finalTemplate, null, 2));

    const version = await Version.createVersion({
      id_template: template.id,
      userId,
      name_version,
      build_number: buildNumber,
      path_thumbnails,
      path_json: `/uploads/templates/${baseName}.json`
    });

    const thumbnailFullPath = path.resolve(`./src/public${path_thumbnails}`);
    await fs.mkdir(path.dirname(thumbnailFullPath), { recursive: true });
    const json = await extraerVariablesDesdeTemplate(finalTemplate);

    if (THUMBNAIL_MODE === "pdf") {
      console.log("🧩 Modo: PDF físico para miniatura");
      const pdfResult = await handleGeneratePdf(null, finalTemplate, json, false);
      await generateThumbnailFromPdf(pdfResult.filePath, thumbnailFullPath);
      await fs.unlink(pdfResult.filePath).catch(() => {});
    } else {
      console.log("🧩 Modo: Buffer para miniatura");
      const pdfResult = await handleGeneratePdf(null, finalTemplate, json, true);
      await generateThumbnailFromBuffer(pdfResult.buffer, thumbnailFullPath);
    }

    // Preparar respuesta
    const responseData = {
      template, 
      version
    };

    res.status(201).json(
      createJSONResponse(201, 'Template creado con versión inicial', responseData)
    );
  } catch (error) {
    console.error('❌ Error en createTemplate:', error);
    res.status(500).json(createJSONResponse(500, 'Error al crear template'));
  }
};


// -------------------------------
// ✅ 3. GUARDAR NUEVA VERSIÓN (NUEVO JSON) CON CONFIGURACIÓN DE PÁGINA
// -------------------------------
export const updateTemplateVersion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid_template } = req.params; // UUID del template
    const { 
      template_data,
      pageSize,
      orientation,
      marginType
    } = req.body;

    // 1️⃣ Buscar template por UUID
    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, 'Template no encontrado'));
    }

    // 2️⃣ Verificar acceso al workspace del template
    const hasAccess = await Workspace.userHasAccess(userId, template.id_workspace);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes acceso al workspace de este template'));
    }

    // 3️⃣ Validar parámetros de configuración de página (si están presentes)
    const validPageSizes = ['CARTA', 'LEGAL', 'INFORME', 'EJECUTIVO', 'A5', 'B5', 'A4', 'FICHA'];
    const validOrientations = ['PORTRAIT', 'LANDSCAPE'];
    const validMarginTypes = ['NONE', 'NORMAL', 'ESTRECHO', 'MODERADO', 'ANCHO'];
    
    // Variables para almacenar la configuración
    let newPageConfig = null;
    let updatedTemplateData = { ...template_data };
    
    // Verificar si se proporcionaron parámetros de configuración de página
    const hasPageConfig = pageSize !== undefined || orientation !== undefined || marginType !== undefined;
    
    if (hasPageConfig) {
      // Determinar los valores a usar (nuevos o existentes)
      const pageSizeToUse = pageSize !== undefined ? pageSize.toUpperCase() : 
                           (template_data?.basePdf?.pageSize || template.page_size || 'CARTA');
      
      const orientationToUse = orientation !== undefined ? orientation.toUpperCase() : 
                              (template_data?.basePdf?.orientation || template.orientation || 'PORTRAIT');
      
      const marginTypeToUse = marginType !== undefined ? marginType.toUpperCase() : 
                             (template_data?.basePdf?.marginType || template.margin_type || 'NORMAL');
      
      // Validar los valores
      if (pageSize !== undefined && !validPageSizes.includes(pageSizeToUse)) {
        return res.status(400).json(createJSONResponse(400, 'Tamaño de hoja no válido'));
      }
      
      if (orientation !== undefined && !validOrientations.includes(orientationToUse)) {
        return res.status(400).json(createJSONResponse(400, 'Orientación no válida'));
      }
      
      if (marginType !== undefined && !validMarginTypes.includes(marginTypeToUse)) {
        return res.status(400).json(createJSONResponse(400, 'Tipo de margen no válido'));
      }
      
      // Obtener configuración completa de la página
      newPageConfig = getPaperConfig(pageSizeToUse, orientationToUse, marginTypeToUse);
      
      // Actualizar el template_data con la nueva configuración
      updatedTemplateData = {
        ...template_data,
        basePdf: {
          ...(template_data.basePdf || {}),
          width: newPageConfig.width,
          height: newPageConfig.height,
          padding: [
            newPageConfig.margins.left,
            newPageConfig.margins.top,
            newPageConfig.margins.right,
            newPageConfig.margins.bottom
          ]
          //pageSize: pageSizeToUse,
          //orientation: orientationToUse,
          //marginType: marginTypeToUse
        }
      };
      
      console.log('✅ Configuración de página actualizada:', {
        pageSize: pageSizeToUse,
        orientation: orientationToUse,
        marginType: marginTypeToUse,
        width: newPageConfig.width,
        height: newPageConfig.height,
        margins: newPageConfig.margins
      });
    }

    // 4️⃣ Calcular nueva versión
    const lastVersion = await Version.getLastByTemplate(template.id);
    const lastBuildNum = parseFloat(lastVersion?.build_number || 0);
    const newBuild = (lastBuildNum + 0.01).toFixed(2);
    const safeBuild = newBuild.replace('.', '_');

    const baseName = `u${userId}-w${template.id_workspace}-t${template.id}-v${safeBuild}`;
    const path_json = path.join(templatesDir, `${baseName}.json`);
    const relativePath = `/uploads/templates/${baseName}.json`;
    const path_thumbnails = `/thumbnails/${baseName}.png`;

    // 5️⃣ Guardar JSON de la versión (con configuración actualizada si corresponde)
    await fs.writeFile(path_json, JSON.stringify(updatedTemplateData, null, 2));
    console.log('✅ JSON guardado con configuración actualizada');

    // 6️⃣ Crear nueva versión en la base de datos
    const version = await Version.createVersion({
      id_template: template.id,
      userId,
      name_version: newBuild,
      build_number: newBuild,
      path_thumbnails,
      path_json: relativePath
    });

    // 7️⃣ Generar thumbnail
    const thumbnailFullPath = path.resolve(`./src/public${path_thumbnails}`);
    await fs.mkdir(path.dirname(thumbnailFullPath), { recursive: true });
    const json = await extraerVariablesDesdeTemplate(updatedTemplateData);

    if (THUMBNAIL_MODE === "pdf") {
      console.log("🧩 Modo: PDF físico para miniatura");
      const pdfResult = await handleGeneratePdf(null, updatedTemplateData, json, false);
      await generateThumbnailFromPdf(pdfResult.filePath, thumbnailFullPath);
      await fs.unlink(pdfResult.filePath).catch(() => {});
    } else {
      console.log("🧩 Modo: Buffer para miniatura");
      console.log(extraerVariablesDesdeTemplate(updatedTemplateData));
      const pdfResult = await handleGeneratePdf(null, updatedTemplateData, json, true);
      await generateThumbnailFromBuffer(pdfResult.buffer, thumbnailFullPath);
    }

    // 8️⃣ Preparar respuesta
    const responseData = {
      version,
      pageConfigUpdated: hasPageConfig,
      ...(hasPageConfig && newPageConfig && {
        pageConfig: {
          pageSize: updatedTemplateData.basePdf.pageSize,
          orientation: updatedTemplateData.basePdf.orientation,
          marginType: updatedTemplateData.basePdf.marginType,
          dimensions: {
            width: newPageConfig.width,
            height: newPageConfig.height
          },
          margins: newPageConfig.margins
        }
      })
    };

    res.status(201).json(createJSONResponse(201, 'Nueva versión creada', responseData));
  } catch (error) {
    console.error('❌ Error en updateTemplateVersion:', error);
    res.status(500).json(createJSONResponse(500, 'Error al crear nueva versión'));
  }
};


// -------------------------------
// ✅ 4. LEER ARCHIVO DE UNA VERSIÓN
// -------------------------------
export const getTemplateFile = async (req, res) => {
  try {
    const { uuid_template, build_number } = req.params; // UUID del template

    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, 'Template no encontrado'));
    }

    const version = await Version.getByTemplateAndBuild(template.id, build_number);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, 'Versión no encontrada'));
    }

    const relativePath = version.path_json.replace(/^\/+/, ''); // quitar "/" inicial
    const absolutePath = path.join(__dirname, '../public', relativePath);

    const fileData = await fs.readFile(absolutePath, 'utf-8');
    const json = JSON.parse(fileData);

    res.json(createJSONResponse(200, 'Plantilla cargada correctamente', json));
  } catch (error) {
    console.error('❌ Error en getTemplateFile:', error);
    res.status(500).json(createJSONResponse(500, 'Error al leer plantilla'));
  }
};

// -------------------------------
// ✅ 5. GENERAR PDF DESDE UNA VERSIÓN
// -------------------------------
export const generatePDF = async (req, res) => {
  try {
    const { uuid_template, build_number } = req.params; // usar UUID en lugar de ID

    // 1️⃣ Buscar el template por UUID
    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, 'Template no encontrado'));
    }

    // 2️⃣ Obtener la versión correspondiente
    const version = await Version.getByTemplateAndBuild(template.id, build_number);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, 'Versión no encontrada'));
    }

    // 3️⃣ Construir ruta absoluta al JSON
    const relativePath = version.path_json.replace(/^\/+/, ''); // quitar "/" inicial
    const absolutePath = path.join(__dirname, '../public', relativePath);
    

    // 4️⃣ Leer JSON de la plantilla
    const template_data = await fs.readFile(absolutePath, 'utf-8');
    const templateJson = JSON.parse(template_data);

    const jsonContent = await extraerVariablesDesdeTemplate(templateJson);

    console.log(jsonContent);

    // 5️⃣ Generar PDF
    await handleGeneratePdf(res, templateJson, jsonContent);
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    res.status(500).json(createJSONResponse(500, 'Error al generar PDF'));
  }
};
// -------------------------------
// ✅ 6. ELIMINAR TEMPLATE
// -------------------------------
export const deleteTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid_template } = req.params; // UUID en lugar de id

    // 1️⃣ Buscar template por UUID
    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, 'Template no encontrado'));
    }

    // 2️⃣ Verificar acceso al workspace del template
    const hasAccess = await Workspace.userHasAccess(userId, template.id_workspace);
    if (!hasAccess) {
      return res.status(403).json(createJSONResponse(403, 'No tienes permiso para eliminar este template'));
    }

    // 3️⃣ Borrado lógico
    await Template.logicalDelete(template.id);

    res.status(200).json(createJSONResponse(200, 'Template eliminado lógicamente'));
  } catch (error) {
    console.error('❌ Error en deleteTemplate:', error);
    res.status(500).json(createJSONResponse(500, 'Error al eliminar template'));
  }
};

// -------------------------------
// ✅ 7. MOVER TEMPLATE A OTRO WORKSPACE
// -------------------------------
export const moveTemplateToWorkspace = async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid_template } = req.params; // usar UUID
    const { new_uuid_workspace } = req.body; // usar UUID del workspace

    // Validar parámetros
    if (!new_uuid_workspace) {
      return res
        .status(400)
        .json(createJSONResponse(400, "El campo 'new_uuid_workspace' es obligatorio"));
    }

    // Buscar template por UUID
    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res
        .status(404)
        .json(createJSONResponse(404, "Template no encontrado"));
    }

    // Validar que no se intente mover al mismo workspace
    const currentWorkspace = await Workspace.getByIdForUser(template.id_workspace, userId);
    const newWorkspace = await Workspace.findByUUID(new_uuid_workspace);

    if (!currentWorkspace || !newWorkspace) {
      return res.status(404).json(
        createJSONResponse(
          404,
          "Workspace actual o nuevo no encontrado"
        )
      );
    }

    if (currentWorkspace.uuid === newWorkspace.uuid) {
      return res
        .status(400)
        .json(createJSONResponse(400, "El template ya pertenece a este workspace"));
    }

    // Validar propiedad del usuario en ambos workspaces
    const canAccessCurrent = await Workspace.userHasAccess(userId, currentWorkspace.id);
    const canAccessNew = await Workspace.userHasAccess(userId, newWorkspace.id);

    if (!canAccessCurrent || !canAccessNew) {
      return res.status(403).json(
        createJSONResponse(
          403,
          "Debes tener acceso a ambos workspaces para mover el template"
        )
      );
    }

    // Actualizar el workspace del template
    await Template.updateWorkspace(template.id, newWorkspace.id);

    res.status(200).json(
      createJSONResponse(200, "Template movido correctamente al nuevo workspace", {
        uuid_template,
        old_workspace_uuid: currentWorkspace.uuid,
        new_uuid_workspace: newWorkspace.uuid,
      })
    );
  } catch (error) {
    console.error("❌ Error en moveTemplateToWorkspace:", error);
    res
      .status(500)
      .json(createJSONResponse(500, "Error al mover el template", { error: error.message }));
  }
};