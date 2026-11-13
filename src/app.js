import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { load as cargarYaml } from 'js-yaml';
import apiRoutes from './routes/index.js';
import { manejarError, manejarNoEncontrado } from './middleware/error.middleware.js';

const app = express();
app.disable('x-powered-by');

app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '100kb' }));

// Limite de intentos de login: 50 cada 15 minutos por defecto (RATE_LIMIT_MAX)
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso, vuelve a intentarlo en unos minutos.' },
});
app.use('/api/auth', limitadorAuth);

// Documentación viva OpenAPI + Swagger UI
const especificacion = cargarYaml(
  fs.readFileSync(new URL('../docs/openapi.yaml', import.meta.url), 'utf8')
);
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(especificacion, { customSiteTitle: 'Sonido Vivo API' })
);

app.use('/api', apiRoutes);
app.use(manejarNoEncontrado);
app.use(manejarError);

export default app;
