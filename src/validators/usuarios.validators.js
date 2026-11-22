import { body, param, query } from 'express-validator';

const ROLES = ['Administrador', 'Vendedor', 'Cliente'];

export const validarListaUsuarios = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser mayor a 0.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limite debe estar entre 1 y 100.'),
  query('q').optional().trim().isLength({ max: 80 }).withMessage('q es demasiado largo.'),
  query('rol').optional().isIn(ROLES).withMessage('El rol indicado no es válido.'),
  query('activo').optional().isIn(['true', 'false']).withMessage('activo debe ser true o false.'),
];

export const validarIdUsuario = [
  param('id').isInt({ min: 1 }).withMessage('El identificador debe ser un entero mayor a 0.'),
];

export const validarCrearUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre debe tener entre 2 y 80 caracteres.'),
  body('email').trim().isEmail().withMessage('El correo no es válido.').normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
  body('telefono')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede superar 20 caracteres.'),
  body('rol').isIn(ROLES).withMessage('El rol debe ser Administrador, Vendedor o Cliente.'),
];

export const validarActualizarUsuario = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre debe tener entre 2 y 80 caracteres.'),
  body('email').trim().isEmail().withMessage('El correo no es válido.').normalizeEmail(),
  body('telefono')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede superar 20 caracteres.'),
  body('rol').isIn(ROLES).withMessage('El rol debe ser Administrador, Vendedor o Cliente.'),
];

export const validarEstadoUsuario = [
  body('activo').isBoolean().withMessage('activo debe ser true o false.'),
];

export const validarPasswordUsuario = [
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
];
