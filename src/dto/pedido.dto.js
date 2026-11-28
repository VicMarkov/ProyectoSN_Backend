export function toCrearPedidoRequest(body) {
  return {
    items: (body?.items || []).map((item) => ({
      idProducto: Number(item?.idProducto),
      cantidad: Number(item?.cantidad),
    })),
    tipoEntrega: body?.tipoEntrega,
    nombreContacto: String(body?.nombreContacto ?? '').trim(),
    emailContacto: String(body?.emailContacto ?? '').trim(),
    telefonoContacto: String(body?.telefonoContacto ?? '').trim(),
    direccionDespacho: body?.direccionDespacho ? String(body.direccionDespacho).trim() : undefined,
  };
}

export function toPedidoResponse(pedido) {
  if (!pedido) return null;
  return {
    id: Number(pedido.id_pedido),
    numeroPedido: pedido.numero_pedido,
    idUsuario: Number(pedido.id_usuario),
    cliente: pedido.cliente,
    clienteEmail: pedido.cliente_email,
    fechaCreacion: pedido.fecha_creacion,
    fechaActualizacion: pedido.fecha_actualizacion,
    estado: pedido.estado,
    tipoEntrega: pedido.tipo_entrega,
    nombreContacto: pedido.nombre_contacto,
    emailContacto: pedido.email_contacto,
    telefonoContacto: pedido.telefono_contacto,
    direccionDespacho: pedido.direccion_despacho,
    subtotal: Number(pedido.subtotal),
    costoEnvio: Number(pedido.costo_envio),
    total: Number(pedido.total),
    items: pedido.items !== undefined ? Number(pedido.items) : undefined,
    unidades: pedido.unidades !== undefined ? Number(pedido.unidades) : undefined,
    detalle: Array.isArray(pedido.detalle) ? pedido.detalle.map(toPedidoDetalleResponse) : undefined,
    historial: Array.isArray(pedido.historial) ? pedido.historial.map(toHistorialResponse) : undefined,
  };
}

export function toPedidoDetalleResponse(detalle) {
  if (!detalle) return null;
  return {
    id: Number(detalle.id_pedido_detalle),
    idProducto: Number(detalle.id_producto),
    sku: detalle.sku,
    nombre: detalle.nombre_producto,
    modelo: detalle.modelo,
    cantidad: Number(detalle.cantidad),
    precioUnitario: Number(detalle.precio_unitario),
    subtotal: Number(detalle.subtotal),
  };
}

export function toHistorialResponse(historial) {
  if (!historial) return null;
  return {
    id: Number(historial.id_historial),
    estadoAnterior: historial.estado_anterior,
    estadoNuevo: historial.estado_nuevo,
    fechaCambio: historial.fecha_cambio,
    usuario: historial.usuario,
    observacion: historial.observacion,
  };
}
