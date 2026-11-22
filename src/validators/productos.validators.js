import { body, param, query } from 'express-validator';

export const validarListaProductos = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El parámetro pagina debe ser un entero mayor a 0.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
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

export const validarListaProductosAdmin = [
  ...validarListaProductos,
  query('activo').optional().isIn(['true', 'false']).withMessage('activo debe ser true o false.'),
];

export const validarIdProducto = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El identificador del producto debe ser un entero mayor a 0.'),
];

const camposProducto = [
  body('sku')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('El SKU debe tener entre 1 y 20 caracteres.'),
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('El nombre debe tener entre 2 y 120 caracteres.'),
  body('modelo')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 })
    .withMessage('El modelo no puede superar 60 caracteres.'),
  body('descripcion')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede superar 2000 caracteres.'),
  body('precio')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número mayor o igual a 0.'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un entero mayor o igual a 0.'),
  body('stockMinimo')
    .isInt({ min: 0 })
    .withMessage('El stock mínimo debe ser un entero mayor o igual a 0.'),
  body('idCategoria')
    .isInt({ min: 1 })
    .withMessage('La categoría debe ser un identificador válido.'),
  body('idMarca')
    .isInt({ min: 1 })
    .withMessage('La marca debe ser un identificador válido.'),
];

export const validarCrearProducto = camposProducto;
export const validarActualizarProducto = camposProducto;

export const validarEstadoProducto = [
  body('activo').isBoolean().withMessage('activo debe ser true o false.'),
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
