// src/models/templateModel.js
import { pool } from '../utils/dbUtils.js';

export default class Template {
  static async create({ title, name, description, id_workspace }) {
    const query = `
      INSERT INTO templates (title, name, description, id_workspace)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [title, name, description, id_workspace];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getById(id) {
    const query = `SELECT * FROM templates WHERE id = $1 AND status = 'active'`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByUUID(uuid) {
    const result = await pool.query(
      'SELECT * FROM templates WHERE uuid = $1 LIMIT 1',
      [uuid]
    );
    return result.rows[0] || null;
  }

  static async getActiveByWorkspace(id_workspace) {
    const query = `
      SELECT *
      FROM templates
      WHERE id_workspace = $1
      AND status = 'active'
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [id_workspace]);
    return result.rows;
  }

  static async getAllActiveByUser(userId, limit = null, offset = 0) {
    const baseQuery = `
      SELECT 
        t.*,
        jsonb_build_object(
          'id', v.id,
          'id_template', v.id_template,
          'name_version', v.name_version,
          'build_number', v.build_number,
          'path_thumbnails', v.path_thumbnails,
          'path_json', v.path_json,
          'created_by', v.created_by,
          'created_at', v.created_at,
          'status', v.status,
          'uuid', v.uuid
        ) AS last_version
      FROM templates t
      INNER JOIN workspaces w ON w.id = t.id_workspace
      INNER JOIN user_workspaces uw ON uw.workspace_id = w.id
      LEFT JOIN LATERAL (
        SELECT vv.*
        FROM template_versions vv
        WHERE vv.id_template = t.id
        ORDER BY vv.build_number DESC
        LIMIT 1
      ) v ON TRUE
      WHERE uw.user_id = $1
        AND t.status = 'active'
      ORDER BY t.created_at DESC
    `;

    let query;
    let values;

    if (limit && !isNaN(limit)) {
      query = `${baseQuery} LIMIT $2 OFFSET $3;`;
      values = [userId, limit, offset];
    } else {
      query = `${baseQuery};`;
      values = [userId];
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async getActiveWithLastVersionByWorkspace(id_workspace) {
    const query = `
      SELECT 
        t.*,  -- Todos los campos del template
        jsonb_build_object(  -- Construye un objeto JSON con la última versión
          'id', v.id,
          'name_version', v.name_version,
          'build_number', v.build_number,
          'path_thumbnails', v.path_thumbnails
        ) AS last_version
      FROM templates t
      LEFT JOIN LATERAL (
        SELECT vv.*
        FROM template_versions vv
        WHERE vv.id_template = t.id  -- Para CADA template...
        ORDER BY vv.build_number DESC  -- ...toma la última versión
        LIMIT 1
      ) v ON TRUE
      WHERE t.id_workspace = $1
        AND t.status = 'active'
      ORDER BY t.created_at DESC;
    `;
    
    const result = await pool.query(query, [id_workspace]);
    return result.rows;
  }

  static async logicalDelete(id) {
    const query = `
      UPDATE templates
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar workspace asociado al template
  static async updateWorkspace(id_template, new_workspace_id) {
    const query = `
      UPDATE templates
      SET id_workspace = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const params = [new_workspace_id, id_template];
    const result = await pool.query(query, params);
    return result.rows[0];
  }
}
