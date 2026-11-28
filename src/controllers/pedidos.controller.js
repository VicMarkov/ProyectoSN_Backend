import * as pedidosService from '../services/pedidos.service.js';
import { toCrearPedidoRequest } from '../dto/pedido.dto.js';

export const crear = async (req, res) => {
  const pedido = await pedidosService.crearPedido(toCrearPedidoRequest(req.body), req.usuario);
  res.status(201).json({ mensaje: 'Pedido creado correctamente.', pedido });
};

export const listar = async (req, res) => {
  const resultado = await pedidosService.listarPedidos({
    usuario: req.usuario,
    estado: req.query.estado || null,
    pagina: Number(req.query.pagina) || 1,
    limite: Number(req.query.limite) || 20,
  });
  res.json(resultado);
};

export const obtener = async (req, res) => {
  const pedido = await pedidosService.obtenerPedido(Number(req.params.id), req.usuario);
  res.json({ pedido });
};

export const cambiarEstado = async (req, res) => {
  const pedido = await pedidosService.cambiarEstadoPedido(
    Number(req.params.id),
    req.body.estado,
    req.usuario,
    req.body.observacion
  );
  res.json({ mensaje: 'Estado del pedido actualizado correctamente.', pedido });
};
