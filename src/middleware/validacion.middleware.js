import { validationResult } from 'express-validator';

export const verificarValidaciones = (req, res, next) => {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();
  res.status(400).json({
    error: 'Los datos enviados no son válidos.',
    errores: resultado.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
  });
};
