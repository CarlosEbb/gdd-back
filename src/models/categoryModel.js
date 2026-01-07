//src\models\categoryModel.js
import { pool } from '../utils/dbUtils.js';

export default class Category {

  static async getAll() {
    const query = `
      SELECT 
        id, 
        uuid, 
        title, 
        category, 
        path_thumbnails, 
        path_json, 
        status, 
        created_at, 
        updated_at
      FROM categories 
      WHERE status = 'active'
      ORDER BY category, title ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener categoría por UUID
  static async findByUUID(uuid) {
    const query = `
      SELECT id, uuid, title, category, path_thumbnails, path_json, status, created_at, updated_at
      FROM categories 
      WHERE uuid = $1 AND status = 'active'
    `;
    const result = await pool.query(query, [uuid]);
    return result.rows[0] || null;
  }
}