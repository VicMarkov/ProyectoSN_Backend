// AWS Lambda (Node.js 24) — Sonido Vivo
// Misma base de datos RDS que usa Express en EC2.
// El paquete pg se despliega junto con la función (zip con node_modules).
// Las credenciales llegan como variables de entorno de la función (consola
// Lambda → Configuración → Variables de entorno), nunca en este archivo.

import pg from 'pg';

const { Pool } = pg;

// El pool se crea una sola vez y se reutiliza entre invocaciones en caliente.
let pool;

function obtenerPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.RDS_HOST,
      port: Number(process.env.RDS_PORT || 5432),
      database: process.env.RDS_DB,
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      max: 2,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (err) => console.error('Pool RDS:', err.message));
  }
  return pool;
}

function respuesta(codigo, cuerpo) {
  return {
    statusCode: codigo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  };
}

export const handler = async (event) => {
  const metodo = event.requestContext?.http?.method || event.httpMethod || 'GET';
  const ruta = event.rawPath || event.path || '/';

  try {
    if (metodo === 'POST' && ruta.endsWith('/productos')) {
      const cuerpo = JSON.parse(event.body || '{}');
      const { sku, nombre, precio, stock } = cuerpo;
      if (!sku || !nombre || precio === undefined) {
        return respuesta(400, { error: 'sku, nombre y precio son obligatorios.' });
      }
      const r = await obtenerPool().query(
        `INSERT INTO producto (sku, nombre, precio, stock)
         VALUES ($1, $2, $3, $4)
         RETURNING id_producto, sku, nombre, precio, stock, fecha_creacion`,
        [sku, nombre, Number(precio), Number(stock || 0)]
      );
      return respuesta(201, { mensaje: 'Producto creado desde Lambda.', producto: r.rows[0] });
    }

    if (metodo === 'GET' && ruta.endsWith('/productos')) {
      const r = await obtenerPool().query(
        `SELECT id_producto, sku, nombre, precio, stock, fecha_creacion
         FROM producto
         WHERE activo = TRUE
         ORDER BY id_producto
         LIMIT 50`
      );
      return respuesta(200, { total: r.rowCount, productos: r.rows, backend: 'AWS Lambda' });
    }

    return respuesta(404, { error: 'Ruta no encontrada' });
  } catch (error) {
    if (error.code === '23505') {
      return respuesta(409, { error: 'El SKU ya existe.' });
    }
    console.error('Error Lambda:', error.message);
    return respuesta(500, { error: 'Error al consultar la base de datos.' });
  }
};
