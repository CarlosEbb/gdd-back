// src/utils/idSelector.js
import dotenv from 'dotenv';
dotenv.config();

export const USE_UUID = process.env.USE_UUID === 'true';

/**
 * Retorna la columna a usar según el modo (id o uuid)
 * @param {string} prefix - prefijo opcional, ej: 'w', 't', etc.
 */
export function getIdColumn(prefix = '') {
  const base = USE_UUID ? 'uuid' : 'id';
  return prefix ? `${prefix}_${base}` : base;
}