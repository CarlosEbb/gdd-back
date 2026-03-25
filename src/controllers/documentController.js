// src/controllers/documentController.js
import Document from '../models/documentModel.js';
import Template from '../models/templateModel.js';
import Version from '../models/versionModel.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { createJSONResponse } from '../utils/responseUtils.js';
import { handleGeneratePdf, extraerVariablesDesdeTemplate, extraerNombresDesdeTemplate } from '../utils/pdfUtils.js';
import { sendEmail, sendEmailViaAPI } from "../utils/emailController.js";

import { createDocumentEncrypt } from '../utils/encryptionUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------
// 1) GUARDAR DOCUMENTO
// -----------------------
// src/controllers/documentController.js

// Flujo 1: Guardar documento con build_number específico
export const saveDocument = async (req, res) => {
  try {
    const { uuid_template, build_number } = req.params;
    const json = req.body;

    if (!uuid_template || uuid_template.trim() === '') {
      return res.status(400).json(createJSONResponse(400, "uuid_template es obligatorio y no puede estar vacío"));
    }

    if (!build_number || build_number.toString().trim() === '') {
      return res.status(400).json(createJSONResponse(400, "build_number es obligatorio y no puede estar vacío"));
    }

    // Buscar template
    const template = await Template.getByUUID(uuid_template);

    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }

    // Verificar que la versión existe
    const version = await Version.getByTemplateAndBuild(template.id, build_number);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, `Versión ${build_number} no encontrada`));
    }

    // Crear el valor encrypt
    const encrypt = createDocumentEncrypt(uuid_template, build_number);

    // Guardar documento con los nuevos campos
    const newDoc = await Document.create({
      jsonData: json,
      id_template: template.id,
      encrypt: encrypt,
      build_number: build_number
    });

    const urlTemp = process.env.APP_URL_BACK;
    const viewUrl = `${urlTemp}/documents/viewPDF/${newDoc.encrypt}`;

    // Enviar correos en background
    await sendEmailsInBackground(json, viewUrl);

    return res.status(201).json({
      status: 201,
      message: "Documento guardado con versión específica",
      data: {
        url: viewUrl,
        build_number: newDoc.build_number
      }
    });

  } catch (error) {
    console.error("❌ Error al guardar documento:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno"));
  }
};

// Flujo 2: Guardar documento con la última versión disponible
export const saveDocumentLastVersion = async (req, res) => {
  try {
    const { uuid_template } = req.params;
    const json = req.body;

    if (!json || !uuid_template) {
      return res.status(400).json(createJSONResponse(400, "Faltan datos obligatorios: uuid_template"));
    }

    // Buscar template
    const template = await Template.getByUUID(uuid_template);

    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }

    // Obtener la última versión del template
    const lastVersion = await Version.getLastByTemplate(template.id);
    if (!lastVersion) {
      return res.status(404).json(createJSONResponse(404, "No hay versiones disponibles para este template"));
    }

    const build_number = lastVersion.build_number;

    // Crear el valor encrypt
    const encrypt = createDocumentEncrypt(uuid_template, build_number);

    // Guardar documento con los nuevos campos
    const newDoc = await Document.create({
      jsonData: json,
      id_template: template.id,
      encrypt: encrypt,
      build_number: build_number
    });

    const urlTemp = process.env.APP_URL_BACK;
    const viewUrl = `${urlTemp}/documents/viewPDF/${newDoc.encrypt}`;

    // Enviar correos en background
    await sendEmailsInBackground(json, viewUrl);

    return res.status(201).json({
      status: 201,
      message: "Documento guardado con última versión",
      data: {
        url: viewUrl,
        build_number: newDoc.build_number
      }
    });

  } catch (error) {
    console.error("❌ Error al guardar documento:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno"));
  }
};

// Función auxiliar para enviar correos en background
const sendEmailsInBackground = async (json, viewUrl) => {
  if (json.correo_destino) {
    const correos = Array.isArray(json.correo_destino)
      ? json.correo_destino
      : [json.correo_destino];

    // Leer el template UNA sola vez
    const filePath = path.join(__dirname, '..', 'views', 'email', 'sentdocument.html');
    let htmlTemplate = await fs.readFile(filePath, 'utf8');
    
    // Reemplazar la variable en el template
    htmlTemplate = htmlTemplate.replaceAll('{{url_document}}', viewUrl);
    
    // Ejecutamos en background sin esperar
    (async () => {
      try {
        const emailMethod = process.env.EMAIL_METHOD || 'smtp';
        
        for (const email of correos) {
          if (emailMethod === 'api') {
            await sendEmailViaAPI(email, viewUrl);
            console.log(`📧 Correo enviado por API a: ${email}`);
          } else {
            await sendEmail(
              email,
              "Documento generado",
              htmlTemplate
            );
            console.log(`📧 Correo enviado por SMTP a: ${email}`);
          }
        }

        console.log(`📬 Correos enviados correctamente en segundo plano (método: ${emailMethod})`);
      } catch (err) {
        console.error("❌ Error enviando correos en background:", err);
      }
    })();
  }
};

// -----------------------
// 2) GENERAR PDF
// -----------------------
export const viewPDF = async (req, res) => {
  try {
    const { encrypt } = req.params;

    // Validar que exista el encrypt
    if (!encrypt) {
      return res.status(400).json(createJSONResponse(400, "Se requiere encrypt"));
    }

    // Buscar documento por encrypt (solo por encrypt)
    const doc = await Document.getByEncrypt(encrypt);
    if (!doc) {
      return res.status(404).json(createJSONResponse(404, "Documento no encontrado"));
    }

    // Obtener el build_number del documento encontrado
    const { build_number } = doc;

    // Buscar template asociado
    const template = await Template.getById(doc.id_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }

    // Buscar la versión específica usando el build_number del documento
    // CORRECCIÓN AQUÍ: usar el nombre correcto del método
    const version = await Version.getByTemplateAndBuild(template.id, build_number);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, `Versión ${build_number} no encontrada`));
    }

    // Ruta absoluta al JSON del template
    const relativePath = version.path_json.replace(/^\/+/, "");
    const absolutePath = path.join(__dirname, "../public", relativePath);

    const templateFile = await fs.readFile(absolutePath, "utf-8");
    const templateJson = JSON.parse(templateFile);

    const jsonContent = doc.json;

    // Generar PDF (TU FUNCIÓN EXISTENTE)
    await handleGeneratePdf(res, templateJson, jsonContent);

  } catch (error) {
    console.error("❌ Error al ver PDF:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno"));
  }
};
// -----------------------
// 3) LISTAR DOCUMENTOS POR TEMPLATE
// -----------------------
export const listByTemplate = async (req, res) => {
  try {
    const { id_template } = req.params;

    const docs = await Document.listByTemplateUUID(id_template);

    return res.status(200).json({
      status: 200,
      data: docs
    });
  } catch (error) {
    console.error("❌ Error al listar documentos:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno"));
  }
};


export const getVariablesFromTemplate = async (req, res) => {
  try {
    const { uuid_template, build_number } = req.params;
    console.log(req.params);
    if (!uuid_template || !build_number) {
      return res.status(400).json({
        status: 400,
        message: "Debe enviar uuid_template y build_number"
      });
    }

    // Obtener template desde modelo
    const template = await Template.getByUUID(uuid_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, 'Template no encontrado'));
    }

    // Obtener versión del template
    const version = await Version.getByTemplateAndBuild(template.id, build_number);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, 'Versión no encontrada'));
    }

    // Obtener ruta absoluta del JSON
    const relativePath = version.path_json.replace(/^\/+/, ''); // quitar "/" inicial
    const absolutePath = path.join(__dirname, '../public', relativePath);

    // Leer archivo JSON
    const fileData = await fs.readFile(absolutePath, 'utf-8');
    const templateJson = JSON.parse(fileData);

    // Extraer variables usando la función creada
    const variables = await extraerVariablesDesdeTemplate(templateJson);
    variables.correo_destino = [
      "contacto@miempresa.com",
      "soporte@miempresa.com",
      "ventas@miempresa.com"
    ];

    const elementos = await extraerNombresDesdeTemplate(templateJson);


    return res.status(200).json(createJSONResponse(200, 'Variables extraídas correctamente', {variables, elementos}));

  } catch (error) {
    console.error("❌ Error al obtener variables del template:", error);
    return res.status(500).json(createJSONResponse(500, 'Error interno del servidor'));
  }
};

export const postValidateVariablesFromTemplate = async (req, res) => {
  try {
    console.log('validaciones', req.body);

    return res.status(200).json(createJSONResponse(200, 'Validaciones aplicadas correctamente', {}));

  } catch (error) {
    console.error("❌ Error al obtener variables del template:", error);
    return res.status(500).json(createJSONResponse(500, 'Error interno del servidor'));
  }
};
