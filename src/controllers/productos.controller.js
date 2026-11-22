import * as productosService from '../services/productos.service.js';

export const listar = async (req, res) => {
  const resultado = await productosService.listarProductos({
    categoria: req.query.categoria || null,
    q: req.query.q || null,
    pagina: Number(req.query.pagina) || 1,
    limite: Number(req.query.limite) || 10,
  });
  res.json(resultado);
};

export const listarAdmin = async (req, res) => {
  const resultado = await productosService.listarProductosAdmin({
    categoria: req.query.categoria || null,
    q: req.query.q || null,
    activo: req.query.activo === undefined ? null : req.query.activo === 'true',
    pagina: Number(req.query.pagina) || 1,
    limite: Number(req.query.limite) || 20,
  });
  res.json(resultado);
};

export const obtener = async (req, res) => {
  const producto = await productosService.obtenerProducto(Number(req.params.id));
  res.json({ producto });
};

export const listarCategorias = async (req, res) => {
  const categorias = await productosService.listarCategorias();
  res.json({ categorias });
};

export const listarMarcas = async (req, res) => {
  const marcas = await productosService.listarMarcas();
  res.json({ marcas });
};

export const crear = async (req, res) => {
  const producto = await productosService.crearProducto(req.body);
  res.status(201).json({ mensaje: 'Producto creado correctamente.', producto });
};

export const actualizar = async (req, res) => {
  const producto = await productosService.actualizarProducto(
    Number(req.params.id),
    req.body,
    req.usuario
  );
  res.json({ mensaje: 'Producto actualizado correctamente.', producto });
};

export const cambiarEstado = async (req, res) => {
  const producto = req.body.activo
    ? await productosService.reactivarProducto(Number(req.params.id))
    : await productosService.eliminarProducto(Number(req.params.id));
  res.json({
    mensaje: producto.activo ? 'Producto activado correctamente.' : 'Producto desactivado correctamente.',
    producto,
  });
};

export const eliminar = async (req, res) => {
  const producto = await productosService.eliminarProducto(Number(req.params.id));
  res.json({ mensaje: 'Producto desactivado correctamente.', producto });
};

export const ajustarStock = async (req, res) => {
  const resultado = await productosService.ajustarStock(
    Number(req.params.id),
    {
      tipo: req.body.tipo,
      cantidad: Number(req.body.cantidad),
      motivo: req.body.motivo,
    },
    req.usuario
  );
  res.json({ mensaje: 'Stock actualizado correctamente.', ...resultado });
};
