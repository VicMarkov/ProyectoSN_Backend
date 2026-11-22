import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const usarSsl = ['true', '1', 'require'].includes(
  String(process.env.PGSSL || process.env.DB_SSL || '').toLowerCase()
);

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'sonido_vivo',
  user: process.env.PGUSER || 'sonido',
  password: process.env.PGPASSWORD || 'sonido123',
  max: Number(process.env.PG_POOL_MAX) || 10,
  connectionTimeoutMillis: Number(process.env.PGCONNECT_TIMEOUT_MS) || 8000,
  idleTimeoutMillis: 30000,
  ssl: usarSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('[pg] error inesperado del pool:', err.message);
});

export const query = (texto, parametros) => pool.query(texto, parametros);
