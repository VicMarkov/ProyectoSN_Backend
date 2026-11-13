import { Router } from 'express';
import * as productosController from '../controllers/productos.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { verificarValidaciones } from '../middleware/validacion.middleware.js';
import {
  validarAjusteStock,
  validarIdProducto,
  validarListaProductos,
} from '../validators/productos.validators.js';

const router = Router();

router.get('/', validarListaProductos, verificarValidaciones, productosController.listar);
router.get('/categorias', productosController.listarCategorias);
router.get('/:id', validarIdProducto, verificarValidaciones, productosController.obtener);
router.put(
  '/:id/stock',
  requireAuth,
  requireRole('Administrador', 'Vendedor'),
  validarIdProducto,
  validarAjusteStock,
  verificarValidaciones,
  productosController.ajustarStock
);

export default router;
