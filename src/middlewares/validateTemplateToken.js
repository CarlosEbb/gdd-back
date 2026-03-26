import { verifyTemplateToken } from '../utils/tokenUtils.js';
import Template from '../models/templateModel.js';

// Función auxiliar para respuestas consistentes
const createJSONResponse = (status, message) => ({
  status,
  message
});

export const validateTemplateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json(createJSONResponse(401, "Token no proporcionado"));
    }
    
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    let decodedToken;
    try {
      decodedToken = verifyTemplateToken(token);
    } catch (error) {
      return res.status(401).json(createJSONResponse(401, error.message));
    }
    
    // Verificar que el template existe y está activo
    const template = await Template.getByUUID(decodedToken.uuid);
    
    if (!template) {
      return res.status(404).json(createJSONResponse(404, "Template no encontrado"));
    }
    
    if (template.status !== 'active') {
      return res.status(403).json(createJSONResponse(403, "Template no está activo"));
    }
    
    // // Opcional: Verificar que el token almacenado en BD coincide (si quieres más seguridad)
    // if (template.jwt_token !== token) {
    //   return res.status(401).json(createJSONResponse(401, "Token inválido o ha sido revocado"));
    // }
    
    // // Adjuntar información al request para usarla en los controladores
    // req.template = template;
    // req.templateToken = decodedToken;
    
    next();
    
  } catch (error) {
    console.error("Error en middleware validateTemplateToken:", error);
    return res.status(500).json(createJSONResponse(500, "Error interno en validación de token"));
  }
};