import jwt from 'jsonwebtoken';

const extraerToken = (req) => {
  const cabecera = req.headers.authorization || '';
  if (!cabecera.startsWith('Bearer ')) return null;
  return cabecera.slice(7).trim();
};

export const requireAuth = (req, res, next) => {
  const token = extraerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Se requiere iniciar sesión para esta operación.' });
  }
  try {
    // Verifica firma, algoritmo permitido, expiración, emisor y destinatario:
    // decodificar el token no basta.
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'sonido-vivo',
      audience: 'sonido-vivo-api',
    });
    req.usuario = {
      id: Number(payload.sub),
      email: payload.email,
      nombre: payload.nombre,
      rol: payload.rol,
    };
    next();
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o ha expirado, inicia sesión nuevamente.' });
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Se requiere iniciar sesión para esta operación.' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta operación.' });
    }
    next();
  };
