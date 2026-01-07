// src/models/userModel.js
import { pool } from '../utils/dbUtils.js';
import bcrypt from 'bcrypt';

export default class User {
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async create(data) {
    const { name, last_name, email, password, country, zip_code, status, id_rol, photo } = data;
    const idRol = id_rol || 2;
    const result = await pool.query(
      `INSERT INTO users (name, last_name, email, password, country, zip_code, status, id_rol, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, last_name, email, password, country, zip_code, status, idRol, photo]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByUUID(uuid) {
    const query = `
      SELECT id, uuid, name, email
      FROM users
      WHERE uuid = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [uuid]);
    return result.rows[0] || null;
  }

  // ✅ Actualizar y devolver la nueva contraseña en hash
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    return hashedPassword;
  }

  static async updateFields(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${keys.length + 1}`,
      [...values, id]
    );
  }
}
