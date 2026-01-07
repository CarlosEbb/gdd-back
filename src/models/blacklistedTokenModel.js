// src/models/blacklistedToken.js
import { pool } from '../utils/dbUtils.js';

export default class BlacklistedTokenModel {
  constructor(data) {
    this.user_id = data.user_id;
    this.token = data.token;
    this.reason = data.reason || null;
  }

  // ✅ Verificar si un token está en la lista negra
  static async isTokenBlacklisted(token) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) AS count FROM blacklisted_tokens WHERE token = $1',
        [token]
      );
      return parseInt(result.rows[0].count, 10) > 0;
    } catch (error) {
      console.error('❌ Error al verificar el token en lista negra:', error);
      // Por seguridad, asumimos que el token es inválido si ocurre un error
      return true;
    }
  }

  // ✅ Agregar un token a la lista negra
  static async addToBlacklist(user_id, token, reason = 'Uso único') {
    try {
      await pool.query(
        `INSERT INTO blacklisted_tokens (user_id, token, reason, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [user_id, token, reason]
      );
    } catch (error) {
      console.error('❌ Error al agregar el token a la lista negra:', error);
    }
  }
}
