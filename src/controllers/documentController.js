// src/controllers/documentController.js
import Document from '../models/documentModel.js';
import Template from '../models/templateModel.js';
import Version from '../models/versionModel.js';

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { createJSONResponse } from '../utils/responseUtils.js';
import { handleGeneratePdf, extraerVariablesDesdeTemplate, extraerNombresDesdeTemplate } from '../utils/pdfUtils.js';
import { sendEmail } from "../utils/emailController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------
// 1) GUARDAR DOCUMENTO
// -----------------------
export const saveDocument = async (req, res) => {
  try {
    const { uuid_template, build_number } = req.params;
    const json = req.body;

    if (!json || !uuid_template || !build_number) {
      return res.status(400).json(createJSONResponse(400, "Faltan datos obligatorios"));
    }

    // Buscar template
    const template = await Template.getByUUID(uuid_template);

    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }

    // Guardar documento
    const newDoc = await Document.create({
      jsonData: json,
      id_template: template.id
    });

    //const viewUrl = `${req.protocol}://${req.get("host")}/documents/viewPDF/${newDoc.uuid}`;
    const urlTemp = process.env.APP_URL_BACK;
    const viewUrl = `${urlTemp}/documents/viewPDF/${newDoc.uuid}`;

    if (json.correo_destino) {
      const correos = Array.isArray(json.correo_destino)
        ? json.correo_destino
        : [json.correo_destino];

      // Leer el template UNA sola vez antes del loop
      const filePath = path.join(__dirname, '..', 'views', 'email', 'sentdocument.html');
      let htmlTemplate = await fs.readFile(filePath, 'utf8');
      
      // Reemplazar la variable en el template
      htmlTemplate = htmlTemplate.replaceAll('{{url_document}}', viewUrl);
      
      // Ejecutamos en background sin esperar
      (async () => {
        try {
          for (const email of correos) {
            // Ya no necesitamos leer el archivo en cada iteración
            await sendEmail(
              email,
              "Documento generado",
              htmlTemplate // Usamos el mismo template ya procesado
            );
          }

          console.log("📬 Correos enviados correctamente en segundo plano");
        } catch (err) {
          console.error("❌ Error enviando correos en background:", err);
        }
      })();
    }

    // ----------------------------------------------------------------------

    return res.status(201).json({
      status: 201,
      message: "Documento guardado",
      data: {
        uuid: newDoc.uuid,
        url: viewUrl
      }
    });

  } catch (error) {
    console.error("❌ Error al guardar documento:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno"));
  }
};

// -----------------------
// 2) GENERAR PDF
// -----------------------
export const viewPDF = async (req, res) => {
  try {
    const { uuid } = req.params;

    const doc = await Document.getByUUID(uuid);
    if (!doc) {
      return res.status(404).json(createJSONResponse(404, "Documento no encontrado"));
    }

    // Buscar template asociado
    const template = await Template.getById(doc.id_template);
    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }

    // Buscar última versión o una específica si quieres
    const version = await Version.getLastByTemplate(template.id);
    if (!version) {
      return res.status(404).json(createJSONResponse(404, "Versión no encontrada"));
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
