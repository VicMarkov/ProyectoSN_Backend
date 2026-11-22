import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { verificarValidaciones } from '../middleware/validacion.middleware.js';
import {
  validarActualizarUsuario,
  validarCrearUsuario,
  validarEstadoUsuario,
  validarIdUsuario,
  validarListaUsuarios,
  validarPasswordUsuario,
} from '../validators/usuarios.validators.js';

const router = Router();

router.use(requireAuth, requireRole('Administrador'));

router.get('/roles', usuariosController.listarRoles);
router.get('/', validarListaUsuarios, verificarValidaciones, usuariosController.listar);
router.get('/:id', validarIdUsuario, verificarValidaciones, usuariosController.obtener);
router.post('/', validarCrearUsuario, verificarValidaciones, usuariosController.crear);
router.put('/:id', validarIdUsuario, validarActualizarUsuario, verificarValidaciones, usuariosController.actualizar);
router.patch(
  '/:id/estado',
  validarIdUsuario,
  validarEstadoUsuario,
  verificarValidaciones,
  usuariosController.cambiarEstado
);
router.patch(
  '/:id/password',
  validarIdUsuario,
  validarPasswordUsuario,
  verificarValidaciones,
  usuariosController.restablecerPassword
);
router.delete('/:id', validarIdUsuario, verificarValidaciones, usuariosController.eliminar);

export default router;
