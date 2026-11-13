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
  categoria: p.categoria || undefined,
  marca: p.marca || undefined,
  activo: p.activo,
});

export const listarProductos = async (filtros) => {
  const { productos, total } = await productosRepo.listar(filtros);
  return {
    productos: productos.map(publicarProducto),
    paginacion: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      paginas: Math.max(1, Math.ceil(total / filtros.limite)),
    },
  };
};

export const obtenerProducto = async (id) => {
  const producto = await productosRepo.buscarPorId(id);
  if (!producto) {
    throw new ErrorDeNegocio(404, 'Producto no encontrado.');
  }
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

export const ajustarStock = async (idProducto, { tipo, cantidad, motivo }, usuario) => {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    const bloqueado = await productosRepo.bloquearStock(cliente, idProducto);
    if (!bloqueado) {
      throw new ErrorDeNegocio(404, 'Producto no encontrado.');
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
