import { pool } from '../config/db.js';
import * as productosRepo from '../repositories/productos.repo.js';
import { ErrorDeNegocio } from './errores.js';

const publicarProducto = (p) => ({
  id: Number(p.id_producto),
  sku: p.sku,
  nombre: p.nombre,
  modelo: p.modelo,
  descripcion: p.descripcion,
  precio: Number(p.precio),
  stock: Number(p.stock),
  stockMinimo: Number(p.stock_minimo),
  idCategoria: Number(p.id_categoria),
  idMarca: Number(p.id_marca),
  categoria: p.categoria || undefined,
  marca: p.marca || undefined,
  activo: p.activo,
  fechaCreacion: p.fecha_creacion,
  fechaActualizacion: p.fecha_actualizacion,
});

const paginacion = (filtros, total) => ({
  pagina: filtros.pagina,
  limite: filtros.limite,
  total,
  paginas: Math.max(1, Math.ceil(total / filtros.limite)),
});

export const listarProductos = async (filtros) => {
  const { productos, total } = await productosRepo.listar(filtros);
  return { productos: productos.map(publicarProducto), paginacion: paginacion(filtros, total) };
};

export const listarProductosAdmin = async (filtros) => {
  const { productos, total } = await productosRepo.listarAdmin(filtros);
  return { productos: productos.map(publicarProducto), paginacion: paginacion(filtros, total) };
};

export const obtenerProducto = async (id) => {
  const producto = await productosRepo.buscarPorId(id);
  if (!producto) throw new ErrorDeNegocio(404, 'Producto no encontrado.');
  return publicarProducto(producto);
};

export const listarCategorias = async () => {
  const categorias = await productosRepo.listarCategorias();
  return categorias.map((c) => ({
    id: Number(c.id_categoria),
    nombre: c.nombre,
    descripcion: c.descripcion,
    productos: c.productos,
  }));
};

export const listarMarcas = async () => {
  const marcas = await productosRepo.listarMarcas();
  return marcas.map((m) => ({ id: Number(m.id_marca), nombre: m.nombre, productos: m.productos }));
};

const validarReferencias = async (idCategoria, idMarca) => {
  const [categoria, marca] = await Promise.all([
    productosRepo.buscarCategoriaPorId(idCategoria),
    productosRepo.buscarMarcaPorId(idMarca),
  ]);
  if (!categoria) throw new ErrorDeNegocio(400, 'La categoría indicada no existe.');
  if (!marca) throw new ErrorDeNegocio(400, 'La marca indicada no existe.');
};

export const crearProducto = async (datos) => {
  const repetido = await productosRepo.buscarPorSku(datos.sku);
  if (repetido) throw new ErrorDeNegocio(409, 'Ya existe un producto con ese SKU.');
  await validarReferencias(datos.idCategoria, datos.idMarca);
  const id = await productosRepo.crear(datos);
  return obtenerProducto(id);
};

export const actualizarProducto = async (id, datos, usuario) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const actual = await productosRepo.buscarPorIdConCliente(cliente, id);
    if (!actual) throw new ErrorDeNegocio(404, 'Producto no encontrado.');

    const repetido = await productosRepo.buscarPorSku(datos.sku, id);
    if (repetido) throw new ErrorDeNegocio(409, 'Ya existe otro producto con ese SKU.');
    await validarReferencias(datos.idCategoria, datos.idMarca);

    const stockAnterior = Number(actual.stock);
    const stockNuevo = Number(datos.stock);
    await productosRepo.actualizarConCliente(cliente, id, { ...datos, stock: stockNuevo });

    if (stockNuevo !== stockAnterior) {
      const diferencia = Math.abs(stockNuevo - stockAnterior);
      await productosRepo.registrarMovimiento(cliente, {
        idProducto: id,
        tipo: 'AJUSTE',
        cantidad: diferencia,
        stockResultante: stockNuevo,
        motivo: 'Actualización desde el panel de productos',
        idUsuario: usuario?.id,
      });
    }

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }

  return obtenerProducto(id);
};

export const eliminarProducto = async (id) => {
  const producto = await productosRepo.buscarPorId(id);
  if (!producto) throw new ErrorDeNegocio(404, 'Producto no encontrado.');
  await productosRepo.cambiarEstado(id, false);
  return obtenerProducto(id);
};

export const reactivarProducto = async (id) => {
  const producto = await productosRepo.buscarPorId(id);
  if (!producto) throw new ErrorDeNegocio(404, 'Producto no encontrado.');
  await productosRepo.cambiarEstado(id, true);
  return obtenerProducto(id);
};

export const ajustarStock = async (idProducto, { tipo, cantidad, motivo }, usuario) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const bloqueado = await productosRepo.bloquearStock(cliente, idProducto);
    if (!bloqueado) {
      throw new ErrorDeNegocio(404, 'Producto no encontrado.');
    }
    if (!bloqueado.activo) {
      throw new ErrorDeNegocio(409, 'No se puede ajustar el stock de un producto inactivo.');
    }

    const stockActual = Number(bloqueado.stock);
    let stockResultante;

    if (tipo === 'ENTRADA') {
      stockResultante = stockActual + cantidad;
    } else if (tipo === 'SALIDA') {
      if (cantidad > stockActual) {
        throw new ErrorDeNegocio(
          409,
          `Stock insuficiente: quedan ${stockActual} unidades disponibles.`
        );
      }
      stockResultante = stockActual - cantidad;
    } else {
      stockResultante = cantidad;
    }

    await productosRepo.actualizarStock(cliente, idProducto, stockResultante);
    const movimiento = await productosRepo.registrarMovimiento(cliente, {
      idProducto,
      tipo,
      cantidad,
      stockResultante,
      motivo: motivo || `Ajuste manual (${tipo})`,
      idUsuario: usuario.id,
    });

    await cliente.query('COMMIT');

    const completo = await productosRepo.buscarPorId(idProducto);
    return {
      producto: publicarProducto(completo),
      movimiento: {
        id: Number(movimiento.id_movimiento),
        tipo,
        cantidad,
        stockResultante,
        fecha: movimiento.fecha,
      },
    };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};
