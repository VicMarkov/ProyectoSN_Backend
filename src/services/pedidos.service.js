import { randomInt } from 'node:crypto';
import { pool } from '../config/db.js';
import * as pedidosRepo from '../repositories/pedidos.repo.js';
import * as productosRepo from '../repositories/productos.repo.js';
import { ErrorDeNegocio } from './errores.js';

const COSTO_ENVIO = 4990;
const ESTADOS = ['EN_PREPARACION', 'DESPACHADO', 'ENTREGADO'];
const TRANSICIONES = {
  EN_PREPARACION: ['DESPACHADO', 'ENTREGADO'],
  DESPACHADO: ['ENTREGADO'],
  ENTREGADO: [],
};

const publicarPedido = (p) => ({
  id: Number(p.id_pedido),
  numeroPedido: p.numero_pedido,
  idUsuario: Number(p.id_usuario),
  cliente: p.cliente,
  clienteEmail: p.cliente_email,
  fechaCreacion: p.fecha_creacion,
  fechaActualizacion: p.fecha_actualizacion,
  estado: p.estado,
  tipoEntrega: p.tipo_entrega,
  nombreContacto: p.nombre_contacto,
  emailContacto: p.email_contacto,
  telefonoContacto: p.telefono_contacto,
  direccionDespacho: p.direccion_despacho,
  subtotal: Number(p.subtotal),
  costoEnvio: Number(p.costo_envio),
  total: Number(p.total),
  items: p.items === undefined ? undefined : Number(p.items),
  unidades: p.unidades === undefined ? undefined : Number(p.unidades),
});

const publicarDetalle = (d) => ({
  id: Number(d.id_pedido_detalle),
  idProducto: Number(d.id_producto),
  sku: d.sku,
  nombre: d.nombre_producto,
  modelo: d.modelo,
  cantidad: Number(d.cantidad),
  precioUnitario: Number(d.precio_unitario),
  subtotal: Number(d.subtotal),
});

const publicarHistorial = (h) => ({
  id: Number(h.id_historial),
  estadoAnterior: h.estado_anterior,
  estadoNuevo: h.estado_nuevo,
  fechaCambio: h.fecha_cambio,
  usuario: h.usuario,
  observacion: h.observacion,
});

const generarNumeroPedido = async () => {
  for (let intento = 0; intento < 12; intento += 1) {
    const numero = `SV-${Date.now().toString().slice(-8)}${randomInt(10, 100)}`;
    if (!(await pedidosRepo.existeNumeroPedido(numero))) return numero;
  }
  throw new ErrorDeNegocio(500, 'No fue posible generar el número del pedido.');
};

const normalizarItems = (items) => {
  const acumulado = new Map();
  for (const item of items) {
    const idProducto = Number(item.idProducto);
    const cantidad = Number(item.cantidad);
    if (!Number.isInteger(idProducto) || idProducto < 1) {
      throw new ErrorDeNegocio(400, 'Cada producto debe tener un identificador válido.');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new ErrorDeNegocio(400, 'Cada cantidad debe ser un entero mayor a 0.');
    }
    acumulado.set(idProducto, (acumulado.get(idProducto) || 0) + cantidad);
  }
  if (acumulado.size === 0) {
    throw new ErrorDeNegocio(400, 'El pedido debe incluir al menos un producto.');
  }
  return [...acumulado.entries()]
    .map(([idProducto, cantidad]) => ({ idProducto, cantidad }))
    .sort((a, b) => a.idProducto - b.idProducto);
};

export const crearPedido = async (datos, usuario) => {
  if (datos.tipoEntrega === 'DOMICILIO' && !String(datos.direccionDespacho || '').trim()) {
    throw new ErrorDeNegocio(400, 'La dirección es obligatoria para el despacho a domicilio.');
  }

  const items = normalizarItems(datos.items);
  const numeroPedido = await generarNumeroPedido();
  const cliente = await pool.connect();
  let idPedido;

  try {
    await cliente.query('BEGIN');

    let subtotal = 0;
    const lineas = [];

    for (const item of items) {
      const producto = await productosRepo.bloquearStock(cliente, item.idProducto);
      if (!producto) {
        throw new ErrorDeNegocio(404, `El producto ${item.idProducto} no existe.`);
      }
      if (!producto.activo) {
        throw new ErrorDeNegocio(409, `El producto "${producto.nombre}" ya no está disponible.`);
      }
      if (Number(producto.stock) < item.cantidad) {
        throw new ErrorDeNegocio(
          409,
          `Stock insuficiente de "${producto.nombre}": quedan ${producto.stock} unidades.`
        );
      }

      const precioUnitario = Number(producto.precio);
      const subtotalLinea = precioUnitario * item.cantidad;
      subtotal += subtotalLinea;
      lineas.push({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal: subtotalLinea,
        nombreProducto: producto.nombre,
        stockResultante: Number(producto.stock) - item.cantidad,
      });
    }

    const costoEnvio = datos.tipoEntrega === 'DOMICILIO' ? COSTO_ENVIO : 0;
    const total = subtotal + costoEnvio;
    const pedido = await pedidosRepo.crearPedido(cliente, {
      numeroPedido,
      idUsuario: usuario.id,
      tipoEntrega: datos.tipoEntrega,
      nombreContacto: datos.nombreContacto,
      emailContacto: datos.emailContacto,
      telefonoContacto: datos.telefonoContacto,
      direccionDespacho: datos.direccionDespacho,
      subtotal,
      costoEnvio,
      total,
    });
    idPedido = Number(pedido.id_pedido);

    for (const linea of lineas) {
      await pedidosRepo.crearDetalle(cliente, {
        idPedido,
        idProducto: linea.idProducto,
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
        subtotal: linea.subtotal,
        nombreProducto: linea.nombreProducto,
      });
      await productosRepo.actualizarStock(cliente, linea.idProducto, linea.stockResultante);
      await productosRepo.registrarMovimiento(cliente, {
        idProducto: linea.idProducto,
        tipo: 'SALIDA',
        cantidad: linea.cantidad,
        stockResultante: linea.stockResultante,
        motivo: `Pedido ${numeroPedido}`,
        idUsuario: usuario.id,
        idPedido,
      });
    }

    await pedidosRepo.registrarHistorial(cliente, {
      idPedido,
      estadoNuevo: 'EN_PREPARACION',
      idUsuario: usuario.id,
      observacion: 'Pedido creado por el cliente.',
    });

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }

  return obtenerPedido(idPedido, usuario);
};

export const listarPedidos = async ({ usuario, estado, pagina, limite }) => {
  const idUsuario = usuario.rol === 'Cliente' ? usuario.id : null;
  const { pedidos, total } = await pedidosRepo.listar({
    idUsuario,
    estado: estado || null,
    pagina,
    limite,
  });
  return {
    pedidos: pedidos.map(publicarPedido),
    paginacion: {
      pagina,
      limite,
      total,
      paginas: Math.max(1, Math.ceil(total / limite)),
    },
  };
};

export const obtenerPedido = async (id, usuario) => {
  const pedido = await pedidosRepo.buscarPorId(id);
  if (!pedido) throw new ErrorDeNegocio(404, 'Pedido no encontrado.');

  if (usuario.rol === 'Cliente' && Number(pedido.id_usuario) !== Number(usuario.id)) {
    throw new ErrorDeNegocio(404, 'Pedido no encontrado.');
  }

  const [detalle, historial] = await Promise.all([
    pedidosRepo.listarDetalle(id),
    pedidosRepo.listarHistorial(id),
  ]);

  return {
    ...publicarPedido(pedido),
    detalle: detalle.map(publicarDetalle),
    historial: historial.map(publicarHistorial),
  };
};

export const cambiarEstadoPedido = async (id, nuevoEstado, usuario, observacion) => {
  if (!ESTADOS.includes(nuevoEstado)) {
    throw new ErrorDeNegocio(400, 'El estado indicado no es válido.');
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const pedido = await pedidosRepo.buscarPorIdConCliente(cliente, id);
    if (!pedido) throw new ErrorDeNegocio(404, 'Pedido no encontrado.');

    if (pedido.estado === nuevoEstado) {
      throw new ErrorDeNegocio(409, 'El pedido ya se encuentra en ese estado.');
    }
    if (!TRANSICIONES[pedido.estado]?.includes(nuevoEstado)) {
      throw new ErrorDeNegocio(
        409,
        `No se puede pasar de ${pedido.estado} a ${nuevoEstado}.`
      );
    }

    await pedidosRepo.actualizarEstado(cliente, id, nuevoEstado);
    await pedidosRepo.registrarHistorial(cliente, {
      idPedido: id,
      estadoAnterior: pedido.estado,
      estadoNuevo: nuevoEstado,
      idUsuario: usuario.id,
      observacion,
    });
    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }

  return obtenerPedido(id, usuario);
};
