// Conexión a Amazon RDS PostgreSQL desde Express (EC2).
// Las credenciales NO viven en el código: se leen de variables de entorno
// definidas en un archivo .env fuera del repositorio (ver .env.example).

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.RDS_HOST,       // endpoint de RDS (sin el puerto)
  port: Number(process.env.RDS_PORT || 5432),
  database: process.env.RDS_DB,     // nombre de la base de datos
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('Error inesperado del pool de RDS:', err.message);
});

module.exports = pool;
