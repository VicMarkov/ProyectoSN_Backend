// Levanta PostgreSQL 16 en local (binarios incluidos en node_modules)
// sin instalar servicios en el sistema. Dejar la terminal abierta:
// Ctrl+C detiene el servidor de forma segura.
import 'dotenv/config';
import fs from 'node:fs';
import EmbeddedPostgres from 'embedded-postgres';

const puerto = Number(process.env.PGPORT) || 5432;
const usuario = process.env.PGUSER || 'sonido';
const clave = process.env.PGPASSWORD || 'sonido123';
const base = process.env.PGDATABASE || 'sonido_vivo';

const pg = new EmbeddedPostgres({
  databaseDir: '.pgdata',
  user: usuario,
  password: clave,
  port: puerto,
  authMethod: 'scram-sha-256',
  persistent: true,
  autoRehydrateSymlinks: true,
  onLog: () => {},
});

if (fs.existsSync('.pgdata/PG_VERSION')) {
  console.log(`[db] clúster existente en .pgdata, se omite initdb`);
} else {
  await pg.initialise();
  console.log(`[db] clúster creado en .pgdata (superusuario "${usuario}")`);
}

await pg.start();
console.log(`[db] PostgreSQL 16 escuchando en localhost:${puerto}`);

try {
  await pg.createDatabase(base);
  console.log(`[db] base de datos "${base}" lista`);
} catch {
  console.log(`[db] la base "${base}" ya existía, se omite`);
}

const parar = async () => {
  console.log('\n[db] deteniendo PostgreSQL...');
  try {
    await pg.stop();
  } finally {
    process.exit(0);
  }
};
process.on('SIGINT', parar);
process.on('SIGTERM', parar);

console.log('[db] deja esta terminal abierta; Ctrl+C para detener la base de datos.');
setInterval(() => {}, 1 << 30);
