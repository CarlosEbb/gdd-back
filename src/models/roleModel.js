// src/models/roleModel.js
import { pool } from '../utils/dbUtils.js';

export default class Role {
  static async getAll() {
    const result = await pool.query('SELECT * FROM roles');
    return result.rows;
  }
}
