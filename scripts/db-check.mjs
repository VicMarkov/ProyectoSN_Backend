import 'dotenv/config';
import { pool } from '../src/config/db.js';

try {
  const { rows } = await pool.query(
    `SELECT current_database() AS base, current_user AS usuario,
            inet_server_addr() AS servidor, now() AS ahora,
            (SELECT count(*)::int FROM information_schema.tables
              WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tablas`
  );
  console.log('[db:check] conexión OK');
  console.log(JSON.stringify(rows[0], null, 2));
} catch (error) {
  console.error('[db:check] error:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
