// src/models/documentModel.js
import { pool } from '../utils/dbUtils.js';
import { createDocumentEncrypt } from '../utils/encryptionUtils.js';

export default class Document {

  static async create({ jsonData, id_template, build_number, uuid_template }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Primero insertamos el documento sin encrypt para obtener el UUID
      const insertQuery = `
        INSERT INTO documents (json, id_template, build_number)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const insertValues = [jsonData, id_template, build_number];
      const insertResult = await client.query(insertQuery, insertValues);
      const newDoc = insertResult.rows[0];
      
      // Obtenemos el UUID generado
      const uuid_documents = newDoc.uuid;
      
      // Generamos el encrypt usando el UUID del documento, UUID del template y build_number
      const encrypt = createDocumentEncrypt(uuid_documents, uuid_template, build_number);
      
      // Actualizamos el documento con el encrypt
      const updateQuery = `
        UPDATE documents 
        SET encrypt = $1 
        WHERE id = $2
        RETURNING *;
      `;
      const updateValues = [encrypt, newDoc.id];
      const updateResult = await client.query(updateQuery, updateValues);
      
      await client.query('COMMIT');
      
      return updateResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getByUUID(uuid) {
    const query = `SELECT * FROM documents WHERE uuid = $1 AND status = 'active'`;
    const result = await pool.query(query, [uuid]);
    return result.rows[0] || null;
  }

  static async getByEncrypt(encrypt) {
    const query = `SELECT * FROM documents WHERE encrypt = $1 AND status = 'active'`;
    const result = await pool.query(query, [encrypt]);
    return result.rows[0] || null;
  }

  static async listByTemplateUUID(uuid_template) {
    const query = `
        SELECT d.id, d.uuid, d.id_template, d.created_at, d.status, d.build_number, d.encrypt
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