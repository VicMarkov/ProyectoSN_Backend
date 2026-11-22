import { query } from '../config/db.js';

const columnas = `p.id_producto, p.sku, p.nombre, p.modelo, p.descripcion, p.precio,
       p.stock, p.stock_minimo, p.activo, p.id_categoria, p.id_marca,
       p.fecha_creacion, p.fecha_actualizacion, c.nombre AS categoria, m.nombre AS marca`;

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
      `(p.nombre ILIKE $${parametros.length} OR p.modelo ILIKE $${parametros.length} OR p.sku ILIKE $${parametros.length} OR m.nombre ILIKE $${parametros.length})`
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

export const listarAdmin = async ({ categoria, q, activo, pagina, limite }) => {
  const condiciones = [];
  const parametros = [];

  if (categoria) {
    parametros.push(categoria);
    condiciones.push(`c.nombre = $${parametros.length}`);
  }
  if (q) {
    parametros.push(`%${q}%`);
    condiciones.push(
      `(p.nombre ILIKE $${parametros.length} OR p.modelo ILIKE $${parametros.length} OR p.sku ILIKE $${parametros.length} OR m.nombre ILIKE $${parametros.length})`
    );
  }
  if (activo !== null && activo !== undefined) {
    parametros.push(activo);
    condiciones.push(`p.activo = $${parametros.length}`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
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

export const buscarPorSku = async (sku, excluirId = null) => {
  const parametros = [sku];
  let filtro = 'lower(p.sku) = lower($1)';
  if (excluirId) {
    parametros.push(excluirId);
    filtro += ' AND p.id_producto <> $2';
  }
  const { rows } = await query(`SELECT p.id_producto FROM producto p WHERE ${filtro}`, parametros);
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

export const listarMarcas = async () => {
  const { rows } = await query(
    `SELECT m.id_marca, m.nombre, count(p.id_producto)::int AS productos
       FROM marca m
       LEFT JOIN producto p ON p.id_marca = m.id_marca AND p.activo = TRUE
      GROUP BY m.id_marca
      ORDER BY m.nombre`
  );
  return rows;
};

export const buscarCategoriaPorId = async (id) => {
  const { rows } = await query(
    'SELECT id_categoria, nombre FROM categoria WHERE id_categoria = $1',
    [id]
  );
  return rows[0] || null;
};

export const buscarMarcaPorId = async (id) => {
  const { rows } = await query('SELECT id_marca, nombre FROM marca WHERE id_marca = $1', [id]);
  return rows[0] || null;
};

export const crear = async (datos) => {
  const { rows } = await query(
    `INSERT INTO producto
        (sku, nombre, modelo, descripcion, precio, stock, stock_minimo, id_categoria, id_marca)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id_producto`,
    [
      datos.sku,
      datos.nombre,
      datos.modelo || null,
      datos.descripcion || null,
      datos.precio,
      datos.stock,
      datos.stockMinimo,
      datos.idCategoria,
      datos.idMarca,
    ]
  );
  return rows[0].id_producto;
};

export const actualizar = async (id, datos) => {
  const { rows } = await query(
    `UPDATE producto
        SET sku = $2, nombre = $3, modelo = $4, descripcion = $5, precio = $6,
            stock = $7, stock_minimo = $8, id_categoria = $9, id_marca = $10,
            fecha_actualizacion = now()
      WHERE id_producto = $1
      RETURNING id_producto`,
    [
      id,
      datos.sku,
      datos.nombre,
      datos.modelo || null,
      datos.descripcion || null,
      datos.precio,
      datos.stock,
      datos.stockMinimo,
      datos.idCategoria,
      datos.idMarca,
    ]
  );
  return rows[0] || null;
};

export const buscarPorIdConCliente = async (client, id) => {
  const { rows } = await client.query(
    `SELECT ${columnas} ${from} WHERE p.id_producto = $1 FOR UPDATE OF p`,
    [id]
  );
  return rows[0] || null;
};

export const actualizarConCliente = async (client, id, datos) => {
  const { rows } = await client.query(
    `UPDATE producto
        SET sku = $2, nombre = $3, modelo = $4, descripcion = $5, precio = $6,
            stock = $7, stock_minimo = $8, id_categoria = $9, id_marca = $10,
            fecha_actualizacion = now()
      WHERE id_producto = $1
      RETURNING id_producto`,
    [
      id,
      datos.sku,
      datos.nombre,
      datos.modelo || null,
      datos.descripcion || null,
      datos.precio,
      datos.stock,
      datos.stockMinimo,
      datos.idCategoria,
      datos.idMarca,
    ]
  );
  return rows[0] || null;
};

export const cambiarEstado = async (id, activo) => {
  const { rows } = await query(
    `UPDATE producto
        SET activo = $2, fecha_actualizacion = now()
      WHERE id_producto = $1
      RETURNING id_producto`,
    [id, activo]
  );
  return rows[0] || null;
};

export const bloquearStock = async (client, id) => {
  const { rows } = await client.query(
    `SELECT p.id_producto, p.stock, p.precio, p.nombre, p.activo
       FROM producto p
      WHERE p.id_producto = $1
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
  { idProducto, tipo, cantidad, stockResultante, motivo, idUsuario, idPedido }
) => {
  const { rows } = await client.query(
    `INSERT INTO movimiento_stock
        (id_producto, tipo, cantidad, stock_resultante, motivo, id_usuario, id_pedido)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_movimiento, fecha`,
    [idProducto, tipo, cantidad, stockResultante, motivo || null, idUsuario || null, idPedido || null]
  );
  return rows[0];
};
