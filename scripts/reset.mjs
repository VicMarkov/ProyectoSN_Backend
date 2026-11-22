// Vuelve a crear el esquema y aplica la semilla de prueba.
// Requiere que PostgreSQL esté corriendo (npm run db:start).
import 'dotenv/config';
import fs from 'node:fs';
import pg from 'pg';

const host = process.env.PGHOST || 'localhost';
const esLocal = ['localhost', '127.0.0.1', '::1'].includes(host);
const confirmado = String(process.env.CONFIRM_RESET || '').toUpperCase() === 'SI';

if (!esLocal || !confirmado) {
  console.error(
    '[reset] operación bloqueada. Solo se permite en local y con CONFIRM_RESET=SI.\n' +
      '        Para RDS usa db:setup (no destructivo).'
  );
  process.exit(1);
}

const usarSsl = ['true', '1', 'require'].includes(
  String(process.env.PGSSL || process.env.DB_SSL || '').toLowerCase()
);

const client = new pg.Client({
  host,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: usarSsl ? { rejectUnauthorized: false } : undefined,
});

try {
  await client.connect();
  console.log('[reset] reconstruyendo esquema público...');
  await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  console.log('[reset] aplicando db/schema.sql...');
  await client.query(fs.readFileSync('db/schema.sql', 'utf8'));
  console.log('[reset] aplicando db/seed.sql...');
  await client.query(fs.readFileSync('db/seed.sql', 'utf8'));
  const { rows } = await client.query(
    'SELECT (SELECT count(*) FROM producto) AS productos, (SELECT count(*) FROM usuario) AS usuarios, (SELECT count(*) FROM categoria) AS categorias'
  );
  console.log('[reset] listo:', JSON.stringify(rows[0]));
} finally {
  await client.end();
}
