// src/routes/templateRoutes.js
import express from 'express';
import multer from 'multer';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getAllUserTemplates,
  getTemplates,
  createTemplate,
  updateTemplateVersion,
  deleteTemplate,
  getTemplateFile,
  generatePDF,
  moveTemplateToWorkspace
} from '../controllers/templateController.js';

const router = express.Router();


const upload = multer({
  storage: multer.memoryStorage(), // Archivos en memoria como Buffer
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
    files: 1, // Solo un archivo
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 Archivo recibido en multer:', {
      nombre: file.originalname,
      tipo: file.mimetype,
      tamaño: file.size
    });

    // Lista de tipos MIME permitidos
    const allowedMimeTypes = [
      'application/json',
      'application/octet-stream', // Para archivos .gz
      'application/gzip',
      'application/x-gzip',
      'text/plain' // Por si acaso
    ];

    const isJson = file.originalname.toLowerCase().endsWith('.json');
    const isGzip = file.originalname.toLowerCase().endsWith('.gz') || 
                   file.originalname.toLowerCase().endsWith('.gzip');
    const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype);

    if (isJson || isGzip || isAllowedMimeType) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido. Tipo: ${file.mimetype}, Nombre: ${file.originalname}. Solo se aceptan archivos .json o .json.gz`));
    }
  }
});

router.get('/', authMiddleware, getAllUserTemplates);
router.get('/:uuid_workspace', authMiddleware, getTemplates);
router.post('/', authMiddleware, createTemplate);

router.post(
  '/:uuid_template/version',
  authMiddleware,                                  
  upload.single('template_data'),    
  (req, res, next) => {              
    console.log('✅ Archivo procesado por multer:', {
      file: req.file ? {
        nombre: req.file.originalname,
        tamaño: req.file.size,
        tipo: req.file.mimetype,
        buffer: req.file.buffer ? `Buffer de ${req.file.buffer.length} bytes` : 'No hay buffer'
      } : 'No hay archivo',
      body: req.body
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo. Asegúrate de enviar el campo "template_data" con el archivo.'
      });
    }

    next();
  },
  updateTemplateVersion
);
router.delete('/:uuid_template', authMiddleware, deleteTemplate);
router.get('/file/:uuid_template/:build_number', authMiddleware, getTemplateFile);
router.get('/generatePDF/:uuid_template/:build_number', (req, res, next) => {
  generatePDF(req, res, next);
});

router.put('/:uuid_template/move', authMiddleware, moveTemplateToWorkspace);

export default router;