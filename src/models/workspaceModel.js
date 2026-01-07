// src/models/workspaceModel.js
import { pool } from '../utils/dbUtils.js';

export default class Workspace {
  // Crear workspace y asignarlo al usuario creador (propietario)
  static async create({ name, icon, user_id }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const workspaceResult = await client.query(
        `INSERT INTO workspaces (name, icon)
         VALUES ($1, $2)
         RETURNING *`,
        [name, icon]
      );
      const workspace = workspaceResult.rows[0];

      await client.query(
        `INSERT INTO user_workspaces (user_id, workspace_id, is_owner)
         VALUES ($1, $2, true)`,
        [user_id, workspace.id]
      );

      await client.query('COMMIT');
      return workspace;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al crear workspace:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Verificar si un usuario es propietario del workspace
  static async isUserOwner(userId, workspaceId) {
    const query = `
      SELECT 1
      FROM user_workspaces
      WHERE user_id = $1 AND workspace_id = $2 AND is_owner = true
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, workspaceId]);
    return result.rowCount > 0;
  }

  // Asignar un workspace a otro usuario
  static async assignUser(workspaceId, targetUserId) {
    const query = `
      INSERT INTO user_workspaces (user_id, workspace_id, is_owner)
      VALUES ($1, $2, false)
      ON CONFLICT (user_id, workspace_id) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [targetUserId, workspaceId]);
    return result.rows[0] || null;
  }

  // Eliminar un usuario del workspace
  static async removeUser(workspaceId, userId) {
    const query = `
      DELETE FROM user_workspaces
      WHERE workspace_id = $1 AND user_id = $2
    `;
    await pool.query(query, [workspaceId, userId]);
    return true;
  }

  static async getAllByUser(userId) {
    const result = await pool.query(`
      SELECT w.*
      FROM workspaces w
      INNER JOIN user_workspaces uw ON uw.workspace_id = w.id
      WHERE uw.user_id = $1
    `, [userId]);
    return result.rows;
  }


  // 🔹 (los métodos anteriores se mantienen igual)
  static async getByUserId(userId) {
    const query = `
      SELECT w.*, uw.is_owner
      FROM workspaces w
      INNER JOIN user_workspaces uw ON uw.workspace_id = w.id
      WHERE uw.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async userHasAccess(userId, workspaceId) {
    const query = `
      SELECT 1
      FROM user_workspaces
      WHERE user_id = $1 AND workspace_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, workspaceId]);
    return result.rowCount > 0;
  }

  // 🔍 Buscar workspace por su UUID
  static async findByUUID(uuid) {
    const query = `
      SELECT *
      FROM workspaces
      WHERE uuid = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [uuid]);
    return result.rows[0] || null;
  }

  static async update(id, { name, icon }) {
    const result = await pool.query(
      `UPDATE workspaces
       SET name = $1, icon = $2
       WHERE id = $3
       RETURNING *`,
      [name, icon, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM user_workspaces WHERE workspace_id = $1', [id]);
    await pool.query('DELETE FROM workspaces WHERE id = $1', [id]);
    return true;
  }

  static async getByUuidForUser(workspaceId, userId) {
    const query = `
      SELECT w.*, uw.is_owner
      FROM workspaces w
      INNER JOIN user_workspaces uw ON uw.workspace_id = w.id
      WHERE w.uuid = $1 AND uw.user_id = $2
      LIMIT 1
    `;
    
    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0] || null;
  }

  static async getByIdForUser(workspaceId, userId) {
    const query = `
      SELECT w.*, uw.is_owner
      FROM workspaces w
      INNER JOIN user_workspaces uw ON uw.workspace_id = w.id
      WHERE w.id = $1 AND uw.user_id = $2
      LIMIT 1
    `;
    
    const result = await pool.query(query, [workspaceId, userId]);
    return result.rows[0] || null;
  }

  static async getUsersByWorkspace(workspaceId) {
    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        uw.is_owner,
        uw.created_at
      FROM user_workspaces uw
      INNER JOIN users u ON u.id = uw.user_id
      WHERE uw.workspace_id = $1
      ORDER BY uw.is_owner DESC, u.name ASC
    `;
    const result = await pool.query(query, [workspaceId]);
    return result.rows;
  }
  
  // Verifica si el usuario es propietario de un workspace
  static async isUserOwner(userId, workspaceId) {
    const query = `
      SELECT 1
      FROM user_workspaces
      WHERE user_id = $1 AND workspace_id = $2 AND is_owner = true
      LIMIT 1
    `;
    const result = await pool.query(query, [userId, workspaceId]);
    return result.rowCount > 0;
  }
}