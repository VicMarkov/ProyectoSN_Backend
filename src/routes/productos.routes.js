import { Router } from 'express';
import * as productosController from '../controllers/productos.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { verificarValidaciones } from '../middleware/validacion.middleware.js';
import {
  validarActualizarProducto,
  validarAjusteStock,
  validarCrearProducto,
  validarEstadoProducto,
  validarIdProducto,
  validarListaProductos,
  validarListaProductosAdmin,
} from '../validators/productos.validators.js';

const router = Router();

router.get('/', validarListaProductos, verificarValidaciones, productosController.listar);
router.get('/categorias', productosController.listarCategorias);
router.get('/marcas', productosController.listarMarcas);
router.get(
  '/admin',
  requireAuth,
  requireRole('Administrador'),
  validarListaProductosAdmin,
  verificarValidaciones,
  productosController.listarAdmin
);
router.get('/:id', validarIdProducto, verificarValidaciones, productosController.obtener);
router.post(
  '/',
  requireAuth,
  requireRole('Administrador'),
  validarCrearProducto,
  verificarValidaciones,
  productosController.crear
);
router.put(
  '/:id',
  requireAuth,
  requireRole('Administrador'),
  validarIdProducto,
  validarActualizarProducto,
  verificarValidaciones,
  productosController.actualizar
);
router.patch(
  '/:id/estado',
  requireAuth,
  requireRole('Administrador'),
  validarIdProducto,
  validarEstadoProducto,
  verificarValidaciones,
  productosController.cambiarEstado
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('Administrador'),
  validarIdProducto,
  verificarValidaciones,
  productosController.eliminar
);
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
