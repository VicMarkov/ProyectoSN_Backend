import { query } from '../config/db.js';

const columnas = `u.id_usuario, u.nombre, u.email, u.telefono, u.activo,
       u.fecha_creacion, r.nombre AS rol`;

const from = `FROM usuario u JOIN rol r ON r.id_rol = u.id_rol`;

export const buscarPorEmail = async (email) => {
  const { rows } = await query(
    `SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.telefono,
            u.activo, u.fecha_creacion, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
      WHERE lower(u.email) = lower($1)`,
    [email]
  );
  return rows[0] || null;
};

export const buscarPorId = async (id) => {
  const { rows } = await query(`SELECT ${columnas} ${from} WHERE u.id_usuario = $1`, [id]);
  return rows[0] || null;
};

export const listar = async ({ q, rol, activo, pagina, limite }) => {
  const condiciones = [];
  const parametros = [];

  if (q) {
    parametros.push(`%${q}%`);
    condiciones.push(
      `(u.nombre ILIKE $${parametros.length} OR u.email ILIKE $${parametros.length})`
    );
  }
  if (rol) {
    parametros.push(rol);
    condiciones.push(`r.nombre = $${parametros.length}`);
  }
  if (activo !== null && activo !== undefined) {
    parametros.push(activo);
    condiciones.push(`u.activo = $${parametros.length}`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const total = await query(`SELECT count(*)::int AS total ${from} ${where}`, parametros);

  parametros.push(limite, (pagina - 1) * limite);
  const { rows } = await query(
    `SELECT ${columnas} ${from} ${where}
      ORDER BY u.id_usuario
      LIMIT $${parametros.length - 1} OFFSET $${parametros.length}`,
    parametros
  );

  return { usuarios: rows, total: total.rows[0].total };
};

export const buscarPorEmailExcluyendo = async (email, id) => {
  const { rows } = await query(
    'SELECT id_usuario FROM usuario WHERE lower(email) = lower($1) AND id_usuario <> $2',
    [email, id]
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

export const actualizar = async (id, { nombre, email, telefono, idRol }) => {
  const { rows } = await query(
    `UPDATE usuario
        SET nombre = $2, email = $3, telefono = $4, id_rol = $5
      WHERE id_usuario = $1
      RETURNING id_usuario, nombre, email, telefono, activo, fecha_creacion`,
    [id, nombre, email, telefono || null, idRol]
  );
  return rows[0] || null;
};

export const actualizarPassword = async (id, passwordHash) => {
  await query('UPDATE usuario SET password_hash = $2 WHERE id_usuario = $1', [id, passwordHash]);
};

export const cambiarEstado = async (id, activo) => {
  const { rows } = await query(
    `UPDATE usuario SET activo = $2
      WHERE id_usuario = $1
      RETURNING id_usuario, nombre, email, telefono, activo, fecha_creacion`,
    [id, activo]
  );
  return rows[0] || null;
};

export const contarAdminsActivos = async () => {
  const { rows } = await query(
    `SELECT count(*)::int AS total
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
      WHERE r.nombre = 'Administrador' AND u.activo = TRUE`
  );
  return rows[0].total;
};

export const listarRoles = async () => {
  const { rows } = await query('SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol');
  return rows;
};

export const buscarRolPorNombre = async (nombre) => {
  const { rows } = await query('SELECT id_rol, nombre FROM rol WHERE lower(nombre) = lower($1)', [
    nombre,
  ]);
  return rows[0] || null;
};
