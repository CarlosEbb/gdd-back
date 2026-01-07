// src/models/versionModel.js
import { pool } from '../utils/dbUtils.js';

export default class Version {
  // 🔹 Obtener la última versión por template
  static async getLastByTemplate(id_template) {
    const query = `
      SELECT *
      FROM template_versions
      WHERE id_template = $1 AND status = 'active'
      ORDER BY build_number DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [id_template]);
    return result.rows[0] || null;
  }

  // 🔹 Crear una nueva versión (usando el build_number ya calculado)
  static async createVersion({ id_template, userId, name_version, build_number, path_thumbnails, path_json }) {
    const nameVer = name_version || '1.00';

    const query = `
      INSERT INTO template_versions (
        id_template, name_version, build_number, path_thumbnails, path_json, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      id_template,
      nameVer,
      build_number,
      path_thumbnails,
      path_json,
      userId
    ]);

    return result.rows[0];
  }

  // 🔹 Obtener la última versión activa por cada name_version
  static async getLatestVersionsByTemplate(id_template) {
    const query = `
      SELECT DISTINCT ON (name_version)
        id, id_template, name_version, build_number, path_thumbnails, path_json, created_at
      FROM template_versions
      WHERE id_template = $1 AND status = 'active'
      ORDER BY name_version, build_number DESC;
    `;
    const result = await pool.query(query, [id_template]);
    return result.rows;
  }

  // 🔹 Obtener historial completo (todas las versiones)
  static async getAllVersionsHistory(id_template) {
    const query = `
      SELECT *
      FROM template_versions
      WHERE id_template = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [id_template]);
    return result.rows;
  }

  // 🔹 Eliminado lógico
  static async logicalDelete(id) {
    const query = `
      UPDATE template_versions
      SET status = 'deleted'
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByTemplateAndBuild(id_template, build_number) {
      const query = `
          SELECT *
          FROM template_versions
          WHERE id_template = $1 AND build_number = $2
          LIMIT 1;
      `;
      const result = await pool.query(query, [id_template, build_number]);
      return result.rows[0] || null;
  }
}
