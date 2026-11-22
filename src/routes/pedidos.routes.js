import { Router } from 'express';
import * as pedidosController from '../controllers/pedidos.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { verificarValidaciones } from '../middleware/validacion.middleware.js';
import {
  validarCrearPedido,
  validarEstadoPedido,
  validarIdPedido,
  validarListaPedidos,
} from '../validators/pedidos.validators.js';

const router = Router();

router.use(requireAuth);

router.get('/', validarListaPedidos, verificarValidaciones, pedidosController.listar);
router.post('/', validarCrearPedido, verificarValidaciones, pedidosController.crear);
router.get('/:id', validarIdPedido, verificarValidaciones, pedidosController.obtener);
router.patch(
  '/:id/estado',
  requireRole('Administrador', 'Vendedor'),
  validarIdPedido,
  validarEstadoPedido,
  verificarValidaciones,
  pedidosController.cambiarEstado
);

export default router;
