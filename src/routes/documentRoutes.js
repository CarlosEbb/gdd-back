// src/routes/documentRoutes.js
import express from "express";
import {
  saveDocument,
  viewPDF,
  listByTemplate,
  getVariablesFromTemplate,
  postValidateVariablesFromTemplate,
  saveDocumentLastVersion
} from "../controllers/documentController.js";

import { validateTemplateToken } from "../middlewares/validateTemplateToken.js";

const router = express.Router();


router.post("/:uuid_template/:build_number", validateTemplateToken, saveDocument);
router.post("/:uuid_template", validateTemplateToken, saveDocumentLastVersion);

router.get("/viewPDF/:encrypt", viewPDF);

router.get("/getTemplate/:id_template", listByTemplate);

router.get("/variables/:uuid_template/:build_number", getVariablesFromTemplate);
router.post("/validate/variables/:uuid_template/:build_number", postValidateVariablesFromTemplate);

postValidateVariablesFromTemplate
export default router;
