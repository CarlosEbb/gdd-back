// src/routes/documentRoutes.js
import express from "express";
import {
  saveDocument,
  viewPDF,
  listByTemplate,
  getVariablesFromTemplate
} from "../controllers/documentController.js";

const router = express.Router();

// 1) Guardar documento
router.post("/:uuid_template/:build_number", saveDocument);

// 2) Ver PDF generado desde UUID
router.get("/viewPDF/:uuid", viewPDF);

// 3) Listado por template
router.get("/getTemplate/:id_template", listByTemplate);

router.get("/variables/:uuid_template/:build_number", getVariablesFromTemplate);

export default router;
