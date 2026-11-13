import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as usuariosRepo from '../repositories/usuarios.repo.js';
import { ErrorDeNegocio } from './errores.js';

const ROL_CLIENTE = 3;
// Costo 12: línea base recomendada por OWASP (mínimo aceptable: 10)
const COSTO_BCRYPT = 12;
const MENSAJE_CREDENCIALES = 'Correo electrónico o contraseña incorrectos.';

const publicarUsuario = (usuario) => ({
  id: Number(usuario.id_usuario),
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol,
});

export const registrar = async ({ nombre, email, password, telefono }) => {
  const existente = await usuariosRepo.buscarPorEmail(email);
  if (existente) {
    throw new ErrorDeNegocio(409, 'Ya existe una cuenta registrada con ese correo electrónico.');
  }
  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT);
  const usuario = await usuariosRepo.crear({ nombre, email, passwordHash, telefono, idRol: ROL_CLIENTE });
  return publicarUsuario({ ...usuario, rol: 'Cliente' });
};

export const iniciarSesion = async ({ email, password }) => {
  const usuario = await usuariosRepo.buscarPorEmail(email);
  if (!usuario || !usuario.activo) {
    throw new ErrorDeNegocio(401, MENSAJE_CREDENCIALES);
  }
  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    throw new ErrorDeNegocio(401, MENSAJE_CREDENCIALES);
  }

  const token = jwt.sign(
    { sub: String(usuario.id_usuario), email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'sonido-vivo',
      audience: 'sonido-vivo-api',
    }
  );

  const decodificado = jwt.decode(token);
  return {
    token,
    tipoToken: 'Bearer',
    expiraEn: new Date(decodificado.exp * 1000).toISOString(),
    usuario: publicarUsuario(usuario),
  };
};

export const obtenerSesion = async (id) => {
  const usuario = await usuariosRepo.buscarPorId(id);
  if (!usuario || !usuario.activo) {
    throw new ErrorDeNegocio(401, 'La sesión no es válida o ha expirado, inicia sesión nuevamente.');
  }
  return publicarUsuario(usuario);
};
