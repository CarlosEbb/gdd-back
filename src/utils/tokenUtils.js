import jwt from 'jsonwebtoken';
import BlacklistedToken from '../models/blacklistedTokenModel.js';

export async function isTokenInvalid(token) {
    try {
        return await BlacklistedToken.isTokenBlacklisted(token);
    } catch (error) {
        console.error('Error al verificar el token en lista negra:', error);
        return true;
    }
}

export async function addToInvalidTokens(user_id, token, reason) {
    try {
        await BlacklistedToken.addToBlacklist(user_id, token, reason);
    } catch (error) {
        console.error('Error al agregar el token a la lista negra:', error);
    }
}

export async function generateResetToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET_RESET, { expiresIn: '1h' });
}

export async function generateAuthToken(user) {
     let time = process.env.TOKEN_EXPIRATION || '8m';
    if(process.env.APP_URL_BACK.includes('localhost')){
        time = '20h';
    }
    return jwt.sign({ id: user.id, rol_id: user.rol_id }, process.env.JWT_SECRET, { expiresIn: time });
}

// ============= FUNCIONES PARA TEMPLATES =============

// Configuración para tokens de templates
const TEMPLATE_TOKEN_EXPIRES_IN = '365d'; // 1 año

export function generateTemplateToken(template) {
  const payload = {
    id: template.id,
    uuid: template.uuid,
    id_workspace: template.id_workspace,
    type: 'template_token',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TEMPLATE_TOKEN_EXPIRES_IN });
}

export function verifyTemplateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que sea un token de tipo template
    if (decoded.type !== 'template_token') {
      throw new Error('Tipo de token inválido');
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('El token del template ha expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token de template inválido');
    }
    throw error;
  }
}