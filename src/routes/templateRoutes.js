//src\routes\templateRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getAllUserTemplates,
  getTemplates,
  createTemplate,
  updateTemplateVersion,
  deleteTemplate,
  getTemplateFile,
  //saveTemplateFile,
  generatePDF,
  moveTemplateToWorkspace
} from '../controllers/templateController.js';

const router = express.Router();

// Rutas principales
router.get('/', authMiddleware, getAllUserTemplates);
router.get('/:uuid_workspace', authMiddleware, getTemplates);
router.post('/', authMiddleware, createTemplate);
router.post('/:uuid_template/version', authMiddleware, updateTemplateVersion);
router.delete('/:uuid_template', authMiddleware, deleteTemplate);

// Rutas para manejo de archivos JSON
router.get('/file/:uuid_template/:build_number', authMiddleware, getTemplateFile);
// router.post('/file/:id_template/:build_number', authMiddleware, saveTemplateFile);

// Generar PDF desde una versión específica
router.get('/generatePDF/:uuid_template/:build_number', (req, res, next) => {
  // Saltar el jsonMiddleware para esta ruta
  generatePDF(req, res, next);
});

router.put('/:uuid_template/move', authMiddleware, moveTemplateToWorkspace);

export default router;
