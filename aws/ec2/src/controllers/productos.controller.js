// Endpoints sobre la entidad producto (misma tabla que consume Lambda).

const pool = require('../config/rds');

// POST /api/productos — inserta un registro (consultas parametrizadas)
async function crearProducto(req, res, next) {
  try {
    const { sku, nombre, precio, stock } = req.body;
    if (!sku || !nombre || precio === undefined) {
      return res.status(400).json({ error: 'sku, nombre y precio son obligatorios.' });
    }
    const resultado = await pool.query(
      `INSERT INTO producto (sku, nombre, precio, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING id_producto, sku, nombre, precio, stock, fecha_creacion`,
      [sku, nombre, Number(precio), Number(stock || 0)]
    );
    return res.status(201).json({ mensaje: 'Producto creado.', producto: resultado.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El SKU ya existe.' });
    }
    return next(error);
  }
}

// GET /api/productos — consulta los registros
async function listarProductos(req, res, next) {
  try {
    const resultado = await pool.query(
      `SELECT id_producto, sku, nombre, precio, stock, fecha_creacion
       FROM producto
       WHERE activo = TRUE
       ORDER BY id_producto
       LIMIT 50`
    );
    return res.status(200).json({ total: resultado.rowCount, productos: resultado.rows });
  } catch (error) {
    return next(error);
  }
}

module.exports = { crearProducto, listarProductos };
