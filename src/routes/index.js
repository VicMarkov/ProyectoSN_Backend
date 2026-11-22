import { Router } from 'express';
import { query } from '../config/db.js';
import authRoutes from './auth.routes.js';
import productosRoutes from './productos.routes.js';
import usuariosRoutes from './usuarios.routes.js';
import pedidosRoutes from './pedidos.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    const { rows } = await query('SELECT now() AS ahora');
    res.json({
      estado: 'ok',
      servicio: 'sonido-vivo-api',
      baseDatos: 'conectada',
      ahora: rows[0].ahora,
    });
  } catch (error) {
    res.status(503).json({
      estado: 'error',
      servicio: 'sonido-vivo-api',
      baseDatos: 'no disponible',
      detalle: error.message,
    });
  }
});

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/pedidos', pedidosRoutes);

router.use((req, res) => {
  res.status(404).json({ error: 'La ruta solicitada no existe.' });
});

export default router;
