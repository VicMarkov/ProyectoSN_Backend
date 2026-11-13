import { query } from '../config/db.js';

const columnas = `p.id_producto, p.sku, p.nombre, p.modelo, p.descripcion, p.precio,
       p.stock, p.stock_minimo, p.activo, c.nombre AS categoria, m.nombre AS marca`;

const from = `FROM producto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
       JOIN marca m ON m.id_marca = p.id_marca`;

export const listar = async ({ categoria, q, pagina, limite }) => {
  const condiciones = ['p.activo = TRUE'];
  const parametros = [];

  if (categoria) {
    parametros.push(categoria);
    condiciones.push(`c.nombre = $${parametros.length}`);
  }
  if (q) {
    parametros.push(`%${q}%`);
    condiciones.push(
      `(p.nombre ILIKE $${parametros.length} OR p.modelo ILIKE $${parametros.length} OR p.sku ILIKE $${parametros.length})`
    );
  }

  const where = `WHERE ${condiciones.join(' AND ')}`;

  const total = await query(`SELECT count(*)::int AS total ${from} ${where}`, parametros);

  parametros.push(limite, (pagina - 1) * limite);
  const { rows } = await query(
    `SELECT ${columnas} ${from} ${where}
      ORDER BY p.id_producto
      LIMIT $${parametros.length - 1} OFFSET $${parametros.length}`,
    parametros
  );

  return { productos: rows, total: total.rows[0].total };
};

export const buscarPorId = async (id) => {
  const { rows } = await query(`SELECT ${columnas} ${from} WHERE p.id_producto = $1`, [id]);
  return rows[0] || null;
};

export const listarCategorias = async () => {
  const { rows } = await query(
    `SELECT c.id_categoria, c.nombre, c.descripcion,
            count(p.id_producto)::int AS productos
       FROM categoria c
       LEFT JOIN producto p ON p.id_categoria = c.id_categoria AND p.activo = TRUE
      WHERE c.activo = TRUE
      GROUP BY c.id_categoria
      ORDER BY c.nombre`
  );
  return rows;
};

export const bloquearStock = async (client, id) => {
  const { rows } = await client.query(
    `SELECT id_producto, stock
       FROM producto
      WHERE id_producto = $1 AND activo = TRUE
      FOR UPDATE`,
    [id]
  );
  return rows[0] || null;
};

export const actualizarStock = async (client, id, stock) => {
  const { rows } = await client.query(
    `UPDATE producto
        SET stock = $2, fecha_actualizacion = now()
      WHERE id_producto = $1
      RETURNING id_producto, sku, nombre, modelo, descripcion, precio, stock,
                stock_minimo, activo`,
    [id, stock]
  );
  return rows[0];
};

export const registrarMovimiento = async (
  client,
  { idProducto, tipo, cantidad, stockResultante, motivo, idUsuario }
) => {
  const { rows } = await client.query(
    `INSERT INTO movimiento_stock
        (id_producto, tipo, cantidad, stock_resultante, motivo, id_usuario)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_movimiento, fecha`,
    [idProducto, tipo, cantidad, stockResultante, motivo || null, idUsuario]
  );
  return rows[0];
};
