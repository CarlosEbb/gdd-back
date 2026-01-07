// src/controllers/authController.js
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import User from '../models/userModel.js';
import BlacklistedPassword from '../models/blacklistedPasswordModel.js';
import { createJSONResponse } from '../utils/responseUtils.js';
import { generateResetToken, isTokenInvalid, addToInvalidTokens } from '../utils/tokenUtils.js';
import { sendEmail } from '../utils/emailController.js';
import moment from 'moment';
import { generateAuthToken } from '../utils/tokenUtils.js';
import Workspace from '../models/workspaceModel.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  try {
    const { name, last_name, email, password, country, zip_code, status, id_rol, photo } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json(createJSONResponse(400, 'El correo ya está registrado'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      last_name,
      email,
      password: hashedPassword,
      country,
      zip_code,
      status,
      id_rol,
      photo
    });

    const defaultWorkspace = await Workspace.create({
      name: `Espacio de trabajado`,
      icon: 'icon-folder',
      user_id: user.id
    });

    const token = await generateAuthToken(user);

    return res.status(201).json(
      createJSONResponse(201, 'Usuario registrado con éxito', {
        user: user,
        workspaces: defaultWorkspace ? [defaultWorkspace] : [],
        token
      })
    );
  } catch (error) {
    console.error('Error en registerUser:', error);
    return res.status(500).json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json(createJSONResponse(404, 'Usuario no encontrado'));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json(createJSONResponse(401, 'Correo o contraseña invalida'));
    }

    // Actualiza la fecha de última conexión
    const now = new Date();
    await User.updateFields(user.id, { last_connection: now });

    // Genera el token JWT
    const token = await generateAuthToken(user);

    // 📂 Obtener todos los workspaces del usuario
    const workspaces = await Workspace.getByUserId(user.id);
    
    // Devuelve respuesta
    res.status(200).json(
      createJSONResponse(200, 'Inicio de sesión exitoso', {
        token,
        user: {
          ...user,
          last_connection: now
        },
        workspaces
      })
    );
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    res
      .status(500)
      .json(createJSONResponse(500, 'Error interno del servidor', { error: error.message }));
  }
};


export const googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body; // tokenId viene del frontend

    // Verifica el token de Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findByEmail(email);
    if (!user) {
      user = await User.create({
        name,
        last_name: '',
        email,
        password: null,
        photo: picture,
        status: 'active',
        id_rol: 2
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, id_rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json(createJSONResponse(200, 'Inicio de sesión con Google exitoso', { token, user }));

  } catch (error) {
    console.error('Error en googleAuth:', error);
    res.status(500).json(createJSONResponse(500, 'Error en Google Auth', { error: error.message }));
  }
};

export const githubLogin = (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
  res.redirect(redirectUrl);
};

export const githubCallback = async (req, res) => {
  try {
    const code = req.query.code;

    // Intercambiar el code por un access_token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Obtener los datos del usuario de GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });
    const userData = await userResponse.json();

    let user = await User.findByEmail(userData.email);
    if (!user) {
      user = await User.create({
        name: userData.name || userData.login,
        last_name: '',
        email: userData.email || `${userData.login}@github.com`,
        password: null,
        photo: userData.avatar_url,
        status: 'active',
        id_rol: 2
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, id_rol: user.id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.redirect(`http://localhost:5173/login-success?token=${token}`);

  } catch (error) {
    console.error('Error en GitHub Auth:', error);
    res.status(500).json(createJSONResponse(500, 'Error en GitHub Auth', { error: error.message }));
  }
};

export const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createJSONResponse(400, 'El correo es obligatorio'));
    }

    // Buscar el usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json(createJSONResponse(404, 'El correo electrónico no existe en el sistema'));
    }

    // Generar token temporal
    const resetToken = await generateResetToken(user.id);

    // Obtener la ruta del archivo actual
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Leer plantilla de correo
    const filePath = path.join(__dirname, '..', 'views', 'email', 'resetPassword.html');
    let htmlEmail = fs.readFileSync(filePath, 'utf8');

    // Reemplazar variables dentro del HTML
    const urlTemp = process.env.APP_URL_FRONT;
    const resetUrl = `${urlTemp}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
    htmlEmail = htmlEmail.replace('{{reset_token}}', resetUrl);
    htmlEmail = htmlEmail.replace('{{first_name}}', user.name);
    htmlEmail = htmlEmail.replace('{{last_name}}', user.last_name);
    htmlEmail = htmlEmail.replace('{{email_user}}', email);
    htmlEmail = htmlEmail.replace('{{url_app}}', urlTemp);

    // Enviar el correo
    await sendEmail(
      email,
      'Recuperación de contraseña',
      htmlEmail
    );

    return res
      .status(200)
      .json(createJSONResponse(200, 'Correo de recuperación enviado correctamente', { email }));

  } catch (error) {
    console.error('Error en resetPasswordRequest:', error);
    res.status(500).json(
      createJSONResponse(500, 'Error interno del servidor', { error: error.message })
    );
  }
};

// Cambiar contraseña con token de recuperación
export const changePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validación manual básica
    if (!token || !newPassword) {
      const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', {
        errors: ['El token y la nueva contraseña son obligatorios.']
      });
      return res.status(400).json(jsonResponse);
    }

    const TokenInvalid = await isTokenInvalid(token);
    if (TokenInvalid) {
      const jsonResponse = createJSONResponse(400, 'Datos de entrada no válidos', {
        errors: ['El token es inválido o ya fue utilizado.']
      });
      return res.status(400).json(jsonResponse);
    }

    // Verificar token JWT
    jwt.verify(token, process.env.JWT_SECRET_RESET, async (err, decoded) => {
      if (err) {
        return res.status(400).json(createJSONResponse(400, 'Token inválido o expirado', {}));
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json(createJSONResponse(404, 'Usuario no encontrado', {}));
      }

      // Evitar reuso de contraseñas anteriores
      const lastPasswords = await BlacklistedPassword.getLastPasswords(user.id);
      const reused = await Promise.all(
        lastPasswords.map(hash => bcrypt.compare(newPassword, hash))
      );

      if (reused.includes(true)) {
        return res.status(400).json(
          createJSONResponse(400, 'Contraseña repetida', {
            errors: [`La nueva contraseña no puede ser igual a las últimas ${process.env.NUMBER_LAST_PASSWORDS} contraseñas.`]
          })
        );
      }

      // Actualizar contraseña
      const hashedPassword = await User.updatePassword(user.id, newPassword);

      // Agregar la nueva contraseña a la lista negra
      await BlacklistedPassword.addToBlacklist(user.id, hashedPassword);

      // Invalida el token usado
      await addToInvalidTokens(user.id, token, 'Cambio de contraseña');

      // Actualiza fecha de expiración de acceso
      const newExpiration = moment()
        .add(process.env.ACCESS_EXPIRATION_DAYS, 'days')
        .format('YYYY-MM-DD');
      await User.updateFields(user.id, {
        failed_attempts: 0,
        access_expiration: newExpiration
      });

      res
        .status(200)
        .json(createJSONResponse(200, 'Contraseña actualizada correctamente', {}));
    });
  } catch (error) {
    console.error('❌ Error al cambiar la contraseña:', error);
    res.status(500).json(createJSONResponse(500, 'Error interno del servidor', {}));
  }
};


export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(createJSONResponse(404, 'Usuario no encontrado'));
    }

    // Datos que regresamos sin password
    const safeUser = {
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      country: user.country,
      zip_code: user.zip_code,
      status: user.status,
      id_rol: user.id_rol,
      photo: user.photo,
      last_connection: user.last_connection,
      created_at: user.created_at
    };

    return res.status(200).json(
      createJSONResponse(200, 'Perfil del usuario obtenido correctamente', safeUser)
    );
  } catch (error) {
    console.error('❌ Error en getMyProfile:', error);
    return res.status(500).json(createJSONResponse(500, 'Error interno del servidor'));
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = { ...req.body };

    const blockedFields = [
      'id',
      'uuid',
      'id_rol',
      'failed_attempts',
      'access_expiration',
      'created_at',
      'last_connection',
      'status',
      'created_at'
    ];

    // Limpiar campos bloqueados
    blockedFields.forEach(field => delete data[field]);

    // 📸 Si viene un archivo, agregarlo al data
    if (req.file) {
      // ruta que guardarás en la BD
      data.photo = `/uploads/img_perfil/${req.file.filename}`;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json(
        createJSONResponse(400, "No hay campos válidos para actualizar")
      );
    }

    await User.updateFields(userId, data);

    const updatedUser = await User.findById(userId);

    res.status(200).json(
      createJSONResponse(200, "Perfil actualizado correctamente", updatedUser)
    );

  } catch (error) {
    console.error("❌ Error en updateUserProfile:", error);
    res.status(500).json(
      createJSONResponse(500, "Error interno al actualizar perfil", { error: error.message })
    );
  }
};
