import { body } from 'express-validator';

export const validarRegistro = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre debe tener entre 2 y 80 caracteres.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 72 })
    .withMessage('La contraseña debe tener entre 8 y 72 caracteres.'),
  body('telefono')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('El teléfono no puede superar los 20 caracteres.'),
];

export const validarLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('El correo electrónico no tiene un formato válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria.'),
];
