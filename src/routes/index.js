import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productosRoutes from './productos.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);

router.use((req, res) => {
  res.status(404).json({ error: 'La ruta solicitada no existe.' });
});

export default router;
