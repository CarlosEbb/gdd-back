// src/index.js
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import workspaces from './routes/workspaceRoutes.js';
import template from './routes/templateRoutes.js';
import category from './routes/categoryRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

import { createJSONResponse } from './utils/responseUtils.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares base
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// CORS
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:8000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

// Seguridad con Helmet
app.use(helmet());

// Configurar encabezados JSON
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Rutas
app.use('/auth', authRoutes);
app.use('/workspace', workspaces);
app.use('/template', template);
app.use('/category', category);
app.use("/documents", documentRoutes);
// Prueba
app.get('/', (req, res) => {
  const response = createJSONResponse(200, 'Servidor activo', { project: 'GDD' });
  res.status(200).json(response);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.message);
  const jsonResponse = createJSONResponse(500, 'Error interno del servidor', { errors: [err.message] });
  res.status(500).json(jsonResponse);
});

// Inicializar servidor
app.listen(PORT, () => console.log(`🚀 Servidor escuchando en el puerto ${PORT}`));