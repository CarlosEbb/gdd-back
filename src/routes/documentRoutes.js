// src/routes/documentRoutes.js
import express from "express";
import {
  saveDocument,
  viewPDF,
  listByTemplate,
  getVariablesFromTemplate,
  postValidateVariablesFromTemplate
} from "../controllers/documentController.js";

const router = express.Router();


router.post("/:uuid_template/:build_number", saveDocument);

router.get("/viewPDF/:uuid", viewPDF);

router.get("/getTemplate/:id_template", listByTemplate);

router.get("/variables/:uuid_template/:build_number", getVariablesFromTemplate);
router.post("/validate/variables/:uuid_template/:build_number", postValidateVariablesFromTemplate);

postValidateVariablesFromTemplate
export default router;
