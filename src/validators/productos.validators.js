import { body, param, query } from 'express-validator';

export const validarListaProductos = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El parámetro pagina debe ser un entero mayor a 0.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('El parámetro limite debe estar entre 1 y 50.'),
  query('categoria')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('El parámetro categoria no puede superar los 60 caracteres.'),
  query('q')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('El parámetro q no puede superar los 60 caracteres.'),
];

export const validarIdProducto = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El identificador del producto debe ser un entero mayor a 0.'),
];

export const validarAjusteStock = [
  body('tipo')
    .isIn(['ENTRADA', 'SALIDA', 'AJUSTE'])
    .withMessage('El tipo debe ser ENTRADA, SALIDA o AJUSTE.'),
  body('cantidad')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un entero mayor a 0.'),
  body('motivo')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 120 })
    .withMessage('El motivo no puede superar los 120 caracteres.'),
];
