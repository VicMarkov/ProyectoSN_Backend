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

export const obtener = async (req, res) => {
  const producto = await productosService.obtenerProducto(Number(req.params.id));
  res.json({ producto });
};

export const listarCategorias = async (req, res) => {
  const categorias = await productosService.listarCategorias();
  res.json({ categorias });
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
