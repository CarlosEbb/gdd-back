// src/models/documentModel.js
import { pool } from '../utils/dbUtils.js';

export default class Document {

  static async create({ jsonData, id_template }) {
    const query = `
      INSERT INTO documents (json, id_template)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [jsonData, id_template];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getByUUID(uuid) {
    const query = `SELECT * FROM documents WHERE uuid = $1 AND status = 'active'`;
    const result = await pool.query(query, [uuid]);
    return result.rows[0] || null;
  }

  static async listByTemplateUUID(uuid_template) {
    const query = `
        SELECT d.id, d.uuid, d.id_template, d.created_at, d.status
        FROM documents d
        INNER JOIN templates t ON t.id = d.id_template
        WHERE t.uuid = $1
        AND d.status = 'active'
        ORDER BY d.created_at DESC;
    `;

    const result = await pool.query(query, [uuid_template]);
    return result.rows;
  }

}
