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
import rateLimit from 'express-rate-limit'; // Importa rate-limit

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

// Configurar rate limiter - 50 peticiones por minuto
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    limit: 50, // 50 peticiones por ventana de tiempo
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        const jsonResponse = createJSONResponse(429, 'Too many requests', {
            errors: ['Has alcanzado el límite de solicitudes. Por favor, espera unos minutos antes de intentarlo de nuevo.']
        });
        res.status(429).json(jsonResponse);
    }
});

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

// APLICAR RATE LIMITER A TODAS LAS RUTAS (opción 1)
// app.use(limiter); // Esto aplica el rate limit a todas las rutas

// APLICAR RATE LIMITER A RUTAS ESPECÍFICAS (opción 2 - recomendada)
app.use('/auth', limiter, authRoutes);
app.use('/workspace', limiter, workspaces);
app.use('/template', limiter, template);
app.use('/category', limiter, category);
app.use("/documents", limiter, documentRoutes);

// También puedes aplicar rate limit a rutas específicas dentro de cada archivo de rutas

// Prueba - esta ruta no tiene rate limit
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