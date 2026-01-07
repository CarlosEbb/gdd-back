import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getAllCategories,
} from '../controllers/categoryController.js';

const router = express.Router();

// Obtener todas las categorías
router.get('/all', authMiddleware, getAllCategories);


export default router;