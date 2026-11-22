import { query } from '../config/db.js';

const columnasPedido = `p.id_pedido, p.numero_pedido, p.id_usuario, p.fecha_creacion,
       p.estado, p.tipo_entrega, p.nombre_contacto, p.email_contacto,
       p.telefono_contacto, p.direccion_despacho, p.subtotal, p.costo_envio,
       p.total, p.fecha_actualizacion, u.nombre AS cliente, u.email AS cliente_email`;

export const existeNumeroPedido = async (numero) => {
  const { rows } = await query('SELECT 1 FROM pedido WHERE numero_pedido = $1', [numero]);
  return rows.length > 0;
};

export const crearPedido = async (client, datos) => {
  const { rows } = await client.query(
    `INSERT INTO pedido
        (numero_pedido, id_usuario, estado, tipo_entrega, nombre_contacto,
         email_contacto, telefono_contacto, direccion_despacho, subtotal,
         costo_envio, total)
     VALUES ($1, $2, 'EN_PREPARACION', $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id_pedido, numero_pedido, fecha_creacion`,
    [
      datos.numeroPedido,
      datos.idUsuario,
      datos.tipoEntrega,
      datos.nombreContacto,
      datos.emailContacto,
      datos.telefonoContacto,
      datos.direccionDespacho || null,
      datos.subtotal,
      datos.costoEnvio,
      datos.total,
    ]
  );
  return rows[0];
};

export const crearDetalle = async (client, datos) => {
  const { rows } = await client.query(
    `INSERT INTO pedido_detalle
        (id_pedido, id_producto, cantidad, precio_unitario, subtotal, nombre_producto)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_pedido_detalle`,
    [
      datos.idPedido,
      datos.idProducto,
      datos.cantidad,
      datos.precioUnitario,
      datos.subtotal,
      datos.nombreProducto,
    ]
  );
  return rows[0];
};

export const registrarHistorial = async (client, datos) => {
  await client.query(
    `INSERT INTO historial_estado_pedido
        (id_pedido, estado_anterior, estado_nuevo, id_usuario, observacion)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      datos.idPedido,
      datos.estadoAnterior || null,
      datos.estadoNuevo,
      datos.idUsuario || null,
      datos.observacion || null,
    ]
  );
};

export const listar = async ({ idUsuario, estado, pagina, limite }) => {
  const condiciones = [];
  const parametros = [];

  if (idUsuario) {
    parametros.push(idUsuario);
    condiciones.push(`p.id_usuario = $${parametros.length}`);
  }
  if (estado) {
    parametros.push(estado);
    condiciones.push(`p.estado = $${parametros.length}`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const total = await query(`SELECT count(*)::int AS total FROM pedido p ${where}`, parametros);

  parametros.push(limite, (pagina - 1) * limite);
  const { rows } = await query(
    `SELECT ${columnasPedido},
            (SELECT count(*)::int FROM pedido_detalle d WHERE d.id_pedido = p.id_pedido) AS items,
            (SELECT coalesce(sum(d.cantidad), 0)::int FROM pedido_detalle d WHERE d.id_pedido = p.id_pedido) AS unidades
       FROM pedido p
       JOIN usuario u ON u.id_usuario = p.id_usuario
       ${where}
      ORDER BY p.fecha_creacion DESC, p.id_pedido DESC
      LIMIT $${parametros.length - 1} OFFSET $${parametros.length}`,
    parametros
  );

  return { pedidos: rows, total: total.rows[0].total };
};

export const buscarPorId = async (id) => {
  const { rows } = await query(
    `SELECT ${columnasPedido}
       FROM pedido p
       JOIN usuario u ON u.id_usuario = p.id_usuario
      WHERE p.id_pedido = $1`,
    [id]
  );
  return rows[0] || null;
};

export const buscarPorIdConCliente = async (client, id) => {
  const { rows } = await client.query('SELECT * FROM pedido WHERE id_pedido = $1 FOR UPDATE', [id]);
  return rows[0] || null;
};

export const listarDetalle = async (idPedido) => {
  const { rows } = await query(
    `SELECT d.id_pedido_detalle, d.id_producto, d.cantidad, d.precio_unitario,
            d.subtotal, d.nombre_producto, pr.sku, pr.modelo
       FROM pedido_detalle d
       LEFT JOIN producto pr ON pr.id_producto = d.id_producto
      WHERE d.id_pedido = $1
      ORDER BY d.id_pedido_detalle`,
    [idPedido]
  );
  return rows;
};

export const listarHistorial = async (idPedido) => {
  const { rows } = await query(
    `SELECT h.id_historial, h.estado_anterior, h.estado_nuevo, h.fecha_cambio,
            h.observacion, u.nombre AS usuario
       FROM historial_estado_pedido h
       LEFT JOIN usuario u ON u.id_usuario = h.id_usuario
      WHERE h.id_pedido = $1
      ORDER BY h.fecha_cambio, h.id_historial`,
    [idPedido]
  );
  return rows;
};

export const actualizarEstado = async (client, id, estado) => {
  const { rows } = await client.query(
    `UPDATE pedido
        SET estado = $2, fecha_actualizacion = now()
      WHERE id_pedido = $1
      RETURNING id_pedido, estado, fecha_actualizacion`,
    [id, estado]
  );
  return rows[0] || null;
};
