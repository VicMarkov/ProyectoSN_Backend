export function toCrearUsuarioRequest(body) {
  return {
    nombre: String(body?.nombre ?? '').trim(),
    email: String(body?.email ?? '').trim(),
    password: body?.password,
    telefono: body?.telefono ? String(body.telefono).trim() : undefined,
    rol: body?.rol,
  };
}

export function toActualizarUsuarioRequest(body) {
  return {
    nombre: String(body?.nombre ?? '').trim(),
    email: String(body?.email ?? '').trim(),
    telefono: body?.telefono ? String(body.telefono).trim() : undefined,
    rol: body?.rol,
  };
}

export function toEstadoUsuarioRequest(body) {
  return { activo: body?.activo };
}

export function toPasswordUsuarioRequest(body) {
  return { password: body?.password };
}

export function toUsuarioResponse(usuario) {
  if (!usuario) return null;
  return {
    id: Number(usuario.id_usuario),
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono ?? null,
    rol: usuario.rol,
    activo: usuario.activo,
    fechaCreacion: usuario.fecha_creacion,
  };
}
