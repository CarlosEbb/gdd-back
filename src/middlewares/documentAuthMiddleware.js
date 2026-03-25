import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 401,
        message: 'No se proporcionó token de autenticación'
      });
    }

    // Verificar que el header tenga el formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 401,
        message: 'Formato de token inválido. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verificar el token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET no está configurado en el .env');
      return res.status(500).json({
        status: 500,
        message: 'Error de configuración del servidor'
      });
    }

    // Decodificar y verificar el token
    const decoded = jwt.verify(token, secret);
    
    // Agregar la información del usuario decodificada al request
    req.user = decoded;
    
    // Continuar con la ejecución
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 401,
        message: 'Token inválido'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 401,
        message: 'Token expirado'
      });
    } else {
      console.error('❌ Error al verificar token:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error al verificar autenticación'
      });
    }
  }
};