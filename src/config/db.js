import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'sonido_vivo',
  user: process.env.PGUSER || 'sonido',
  password: process.env.PGPASSWORD || 'sonido123',
  max: 10,
});

pool.on('error', (err) => {
  console.error('[pg] error inesperado del pool:', err.message);
});

export const query = (texto, parametros) => pool.query(texto, parametros);
