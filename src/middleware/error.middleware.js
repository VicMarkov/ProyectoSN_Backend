export const manejarNoEncontrado = (req, res) => {
  res.status(404).json({ error: 'La ruta solicitada no existe.' });
};

export const manejarError = (err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido.' });
  }
  console.error('[error]', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
};
