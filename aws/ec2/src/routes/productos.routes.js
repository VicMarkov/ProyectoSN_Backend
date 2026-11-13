const express = require('express');
const router = express.Router();
const controlador = require('../controllers/productos.controller');

router.post('/productos', controlador.crearProducto);
router.get('/productos', controlador.listarProductos);

module.exports = router;
