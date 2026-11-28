import * as usuariosService from '../services/usuarios.service.js';
import {
  toCrearUsuarioRequest,
  toActualizarUsuarioRequest,
  toEstadoUsuarioRequest,
  toPasswordUsuarioRequest,
} from '../dto/usuario.dto.js';

export const listar = async (req, res) => {
  const resultado = await usuariosService.listarUsuarios({
    q: req.query.q || null,
    rol: req.query.rol || null,
    activo: req.query.activo === undefined ? null : req.query.activo === 'true',
    pagina: Number(req.query.pagina) || 1,
    limite: Number(req.query.limite) || 20,
  });
  res.json(resultado);
};

export const obtener = async (req, res) => {
  const usuario = await usuariosService.obtenerUsuario(Number(req.params.id));
  res.json({ usuario });
};

export const listarRoles = async (req, res) => {
  const roles = await usuariosService.listarRoles();
  res.json({ roles });
};

export const crear = async (req, res) => {
  const usuario = await usuariosService.crearUsuario(toCrearUsuarioRequest(req.body));
  res.status(201).json({ mensaje: 'Usuario creado correctamente.', usuario });
};

export const actualizar = async (req, res) => {
  const usuario = await usuariosService.actualizarUsuario(
    Number(req.params.id),
    toActualizarUsuarioRequest(req.body),
    req.usuario
  );
  res.json({ mensaje: 'Usuario actualizado correctamente.', usuario });
};

export const cambiarEstado = async (req, res) => {
  const usuario = await usuariosService.cambiarEstadoUsuario(
    Number(req.params.id),
    toEstadoUsuarioRequest(req.body).activo,
    req.usuario
  );
  res.json({
    mensaje: usuario.activo ? 'Usuario activado correctamente.' : 'Usuario desactivado correctamente.',
    usuario,
  });
};

export const eliminar = async (req, res) => {
  const usuario = await usuariosService.eliminarUsuario(Number(req.params.id), req.usuario);
  res.json({ mensaje: 'Usuario desactivado correctamente.', usuario });
};

export const restablecerPassword = async (req, res) => {
  await usuariosService.restablecerPassword(Number(req.params.id), toPasswordUsuarioRequest(req.body).password);
  res.json({ mensaje: 'Contraseña actualizada correctamente.' });
};
