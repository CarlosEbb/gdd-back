// src/models/blacklistedPasswordModel.js
import { pool } from '../utils/dbUtils.js';

export default class BlacklistedPassword {
  static async addToBlacklist(user_id, password) {
    try {
      await pool.query(
        'INSERT INTO blacklisted_password (user_id, password) VALUES ($1, $2)',
        [user_id, password]
      );
    } catch (error) {
      console.error('❌ Error al agregar la contraseña a la lista negra:', error);
    }
  }

  static async getLastPasswords(user_id) {
    const number = process.env.NUMBER_LAST_PASSWORDS || 8;
    try {
      const result = await pool.query(
        `SELECT password FROM blacklisted_password
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [user_id, number]
      );
      return result.rows.map(row => row.password);
    } catch (error) {
      console.error(`❌ Error al obtener las últimas ${number} contraseñas:`, error);
      return [];
    }
  }
}
