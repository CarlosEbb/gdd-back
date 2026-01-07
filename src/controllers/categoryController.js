//src\controllers\categoryController.js
import Category from '../models/categoryModel.js';
import { createJSONResponse } from '../utils/responseUtils.js';


// Obtener todas las categorías AGUPADAS por categoría
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.json(
      createJSONResponse(200, 'Categorías obtenidas correctamente', {
        categories
      })
    );
  } catch (error) {
    console.error('❌ Error en getAllCategoriesUngrouped:', error);
    res.status(500).json(
      createJSONResponse(500, 'Error al obtener las categorías', { error: error.message })
    );
  }
};
