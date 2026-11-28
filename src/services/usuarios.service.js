import bcrypt from 'bcrypt';
import * as usuariosRepo from '../repositories/usuarios.repo.js';
import { toUsuarioResponse } from '../dto/usuario.dto.js';
import { ErrorDeNegocio } from './errores.js';

const COSTO_BCRYPT = 12;
const ROLES_VALIDOS = ['Administrador', 'Vendedor', 'Cliente'];

const publicarUsuario = toUsuarioResponse;

const normalizarRol = (rol) => {
  const encontrado = ROLES_VALIDOS.find((nombre) => nombre.toLowerCase() === String(rol).toLowerCase());
  return encontrado || null;
};

export const listarUsuarios = async (filtros) => {
  const { usuarios, total } = await usuariosRepo.listar(filtros);
  return {
    usuarios: usuarios.map(publicarUsuario),
    paginacion: {
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      paginas: Math.max(1, Math.ceil(total / filtros.limite)),
    },
  };
};

export const obtenerUsuario = async (id) => {
  const usuario = await usuariosRepo.buscarPorId(id);
  if (!usuario) throw new ErrorDeNegocio(404, 'Usuario no encontrado.');
  return publicarUsuario(usuario);
};

export const listarRoles = async () => {
  const roles = await usuariosRepo.listarRoles();
  return roles.map((rol) => ({ id: Number(rol.id_rol), nombre: rol.nombre, descripcion: rol.descripcion }));
};

export const crearUsuario = async ({ nombre, email, password, telefono, rol }) => {
  const nombreRol = normalizarRol(rol);
  if (!nombreRol) throw new ErrorDeNegocio(400, 'El rol indicado no es válido.');

  const existente = await usuariosRepo.buscarPorEmail(email);
  if (existente) throw new ErrorDeNegocio(409, 'Ya existe un usuario con ese correo electrónico.');

  const rolBd = await usuariosRepo.buscarRolPorNombre(nombreRol);
  if (!rolBd) throw new ErrorDeNegocio(400, 'El rol indicado no existe en la base de datos.');

  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT);
  const usuario = await usuariosRepo.crear({
    nombre,
    email,
    passwordHash,
    telefono,
    idRol: rolBd.id_rol,
  });
  return publicarUsuario({ ...usuario, rol: nombreRol });
};

export const actualizarUsuario = async (id, datos, actor) => {
  const actual = await usuariosRepo.buscarPorId(id);
  if (!actual) throw new ErrorDeNegocio(404, 'Usuario no encontrado.');

  const nombreRol = normalizarRol(datos.rol);
  if (!nombreRol) throw new ErrorDeNegocio(400, 'El rol indicado no es válido.');

  if (Number(actor.id) === Number(id) && nombreRol !== 'Administrador') {
    throw new ErrorDeNegocio(409, 'No puedes quitarte a ti mismo el rol de Administrador.');
  }

  if (actual.rol === 'Administrador' && nombreRol !== 'Administrador') {
    const admins = await usuariosRepo.contarAdminsActivos();
    if (admins <= 1) {
      throw new ErrorDeNegocio(409, 'Debe existir al menos un Administrador activo.');
    }
  }

  const repetido = await usuariosRepo.buscarPorEmailExcluyendo(datos.email, id);
  if (repetido) throw new ErrorDeNegocio(409, 'Ya existe otro usuario con ese correo electrónico.');

  const rolBd = await usuariosRepo.buscarRolPorNombre(nombreRol);
  if (!rolBd) throw new ErrorDeNegocio(400, 'El rol indicado no existe en la base de datos.');

  const actualizado = await usuariosRepo.actualizar(id, {
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    idRol: rolBd.id_rol,
  });
  return publicarUsuario({ ...actualizado, rol: nombreRol });
};

export const cambiarEstadoUsuario = async (id, activo, actor) => {
  const actual = await usuariosRepo.buscarPorId(id);
  if (!actual) throw new ErrorDeNegocio(404, 'Usuario no encontrado.');

  if (Number(actor.id) === Number(id) && !activo) {
    throw new ErrorDeNegocio(409, 'No puedes desactivar tu propia cuenta.');
  }

  if (actual.rol === 'Administrador' && actual.activo && !activo) {
    const admins = await usuariosRepo.contarAdminsActivos();
    if (admins <= 1) {
      throw new ErrorDeNegocio(409, 'Debe existir al menos un Administrador activo.');
    }
  }

  const actualizado = await usuariosRepo.cambiarEstado(id, activo);
  return publicarUsuario({ ...actualizado, rol: actual.rol });
};

export const eliminarUsuario = async (id, actor) => {
  return cambiarEstadoUsuario(id, false, actor);
};

export const restablecerPassword = async (id, password) => {
  const actual = await usuariosRepo.buscarPorId(id);
  if (!actual) throw new ErrorDeNegocio(404, 'Usuario no encontrado.');
  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT);
  await usuariosRepo.actualizarPassword(id, passwordHash);
};
