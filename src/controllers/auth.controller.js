import * as authService from '../services/auth.service.js';

export const registrar = async (req, res) => {
  const usuario = await authService.registrar(req.body);
  res.status(201).json({ mensaje: 'Cuenta creada correctamente.', usuario });
};

export const iniciarSesion = async (req, res) => {
  const resultado = await authService.iniciarSesion(req.body);
  res.json({ mensaje: 'Inicio de sesión exitoso.', ...resultado });
};

export const obtenerSesion = async (req, res) => {
  const usuario = await authService.obtenerSesion(req.usuario.id);
  res.json({ usuario });
};
