import 'dotenv/config';
import fs from 'node:fs';
import { pool } from '../src/config/db.js';

const schema = fs.readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
const seed = fs.readFileSync(new URL('../db/seed.sql', import.meta.url), 'utf8');

const cliente = await pool.connect();
try {
  const { rows } = await cliente.query("SELECT to_regclass('public.rol') AS tabla");
  if (rows[0].tabla) {
    console.log('[db:setup] la base ya tiene el esquema aplicado; no se modifica.');
    console.log('[db:setup] usa db:reset solo en local si necesitas reconstruirla.');
    process.exitCode = 0;
  } else {
    console.log('[db:setup] aplicando db/schema.sql...');
    await cliente.query('BEGIN');
    await cliente.query(schema);
    console.log('[db:setup] aplicando db/seed.sql...');
    await cliente.query(seed);
    await cliente.query('COMMIT');

    const { rows: resumen } = await cliente.query(
      `SELECT (SELECT count(*)::int FROM producto) AS productos,
              (SELECT count(*)::int FROM categoria) AS categorias,
              (SELECT count(*)::int FROM marca) AS marcas,
              (SELECT count(*)::int FROM usuario) AS usuarios,
              (SELECT count(*)::int FROM rol) AS roles`
    );
    console.log('[db:setup] listo:', JSON.stringify(resumen[0]));
  }
} catch (error) {
  await cliente.query('ROLLBACK').catch(() => {});
  console.error('[db:setup] error:', error.message);
  process.exitCode = 1;
} finally {
  cliente.release();
  await pool.end();
}
