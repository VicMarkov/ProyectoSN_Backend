import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { verificarValidaciones } from '../middleware/validacion.middleware.js';
import { validarLogin, validarRegistro } from '../validators/auth.validators.js';

const router = Router();

router.post('/register', validarRegistro, verificarValidaciones, authController.registrar);
router.post('/login', validarLogin, verificarValidaciones, authController.iniciarSesion);
router.get('/me', requireAuth, authController.obtenerSesion);

export default router;
