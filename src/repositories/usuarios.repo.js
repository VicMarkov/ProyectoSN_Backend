import { query } from '../config/db.js';

export const buscarPorEmail = async (email) => {
  const { rows } = await query(
    `SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.telefono,
            u.activo, u.fecha_creacion, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
      WHERE u.email = $1`,
    [email]
  );
  return rows[0] || null;
};

export const buscarPorId = async (id) => {
  const { rows } = await query(
    `SELECT u.id_usuario, u.nombre, u.email, u.telefono, u.activo,
            u.fecha_creacion, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
      WHERE u.id_usuario = $1`,
    [id]
  );
  return rows[0] || null;
};

export const crear = async ({ nombre, email, passwordHash, telefono, idRol }) => {
  const { rows } = await query(
    `INSERT INTO usuario (nombre, email, password_hash, telefono, id_rol)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_usuario, nombre, email, telefono, activo, fecha_creacion`,
    [nombre, email, passwordHash, telefono || null, idRol]
  );
  return rows[0];
};
