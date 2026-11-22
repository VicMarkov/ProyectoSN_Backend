import { body, param, query } from 'express-validator';

const ESTADOS = ['EN_PREPARACION', 'DESPACHADO', 'ENTREGADO'];

export const validarCrearPedido = [
  body('items').isArray({ min: 1, max: 50 }).withMessage('El pedido debe incluir productos.'),
  body('items.*.idProducto')
    .isInt({ min: 1 })
    .withMessage('Cada producto debe tener un identificador válido.'),
  body('items.*.cantidad')
    .isInt({ min: 1, max: 999 })
    .withMessage('Cada cantidad debe estar entre 1 y 999.'),
  body('tipoEntrega')
    .isIn(['DOMICILIO', 'RETIRO_TIENDA'])
    .withMessage('El tipo de entrega debe ser DOMICILIO o RETIRO_TIENDA.'),
  body('nombreContacto')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('El nombre de contacto debe tener entre 2 y 80 caracteres.'),
  body('emailContacto')
    .trim()
    .isEmail()
    .withMessage('El correo de contacto no es válido.')
    .normalizeEmail(),
  body('telefonoContacto')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('El teléfono de contacto debe tener entre 6 y 20 caracteres.'),
  body('direccionDespacho')
    .if(body('tipoEntrega').equals('DOMICILIO'))
    .trim()
    .isLength({ min: 8, max: 160 })
    .withMessage('La dirección debe tener entre 8 y 160 caracteres.'),
  body('direccionDespacho')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 160 })
    .withMessage('La dirección no puede superar 160 caracteres.'),
];

export const validarListaPedidos = [
  query('pagina').optional().isInt({ min: 1 }).withMessage('pagina debe ser mayor a 0.'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limite debe estar entre 1 y 100.'),
  query('estado').optional().isIn(ESTADOS).withMessage('El estado indicado no es válido.'),
];

export const validarIdPedido = [
  param('id').isInt({ min: 1 }).withMessage('El identificador debe ser un entero mayor a 0.'),
];

export const validarEstadoPedido = [
  body('estado').isIn(ESTADOS).withMessage('El estado indicado no es válido.'),
  body('observacion')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('La observación no puede superar 200 caracteres.'),
];
