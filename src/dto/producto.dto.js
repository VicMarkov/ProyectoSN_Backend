export function toCrearProductoRequest(body) {
  return {
    sku: String(body?.sku ?? '').trim(),
    nombre: String(body?.nombre ?? '').trim(),
    modelo: body?.modelo ? String(body.modelo).trim() : undefined,
    descripcion: body?.descripcion ? String(body.descripcion).trim() : undefined,
    precio: Number(body?.precio),
    stock: Number(body?.stock),
    stockMinimo: Number(body?.stockMinimo),
    idCategoria: Number(body?.idCategoria),
    idMarca: Number(body?.idMarca),
  };
}

export function toActualizarProductoRequest(body) {
  return toCrearProductoRequest(body);
}

export function toProductoResponse(producto) {
  if (!producto) return null;
  return {
    id: Number(producto.id_producto),
    sku: producto.sku,
    nombre: producto.nombre,
    modelo: producto.modelo,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stock: Number(producto.stock),
    stockMinimo: Number(producto.stock_minimo),
    idCategoria: Number(producto.id_categoria),
    idMarca: Number(producto.id_marca),
    categoria: producto.categoria,
    marca: producto.marca,
    activo: producto.activo,
    fechaCreacion: producto.fecha_creacion,
    fechaActualizacion: producto.fecha_actualizacion,
  };
}
