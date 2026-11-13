// Casos de prueba reales de la API (Guía de planificación, paso 8).
// Reinicia la BD con su semilla, ejecuta los casos contra el servidor
// corriendo en localhost:3000 y guarda el registro en docs/evidencias/.
// Uso: npm run pruebas:api   (requiere db:start y npm start en otras terminales)
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const BASE = `http://localhost:${process.env.PORT || 3000}`;
const resultados = [];

const evaluar = (grupo, descripcion, esperado, obtenido) => {
  const ok = String(esperado) === String(obtenido);
  resultados.push({ grupo, descripcion, esperado, obtenido, ok });
  return ok;
};

const peticion = async (metodo, ruta, { cuerpo, token, cabeceras } = {}) => {
  const encabezados = { 'Content-Type': 'application/json', ...(cabeceras || {}) };
  if (token) encabezados.Authorization = `Bearer ${token}`;
  const respuesta = await fetch(BASE + ruta, {
    method: metodo,
    headers: encabezados,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }
  return { status: respuesta.status, datos, cabeceras: respuesta.headers };
};

const reiniciarBase = async () => {
  const cliente = new pg.Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await cliente.connect();
  await cliente.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await cliente.query(fs.readFileSync('db/schema.sql', 'utf8'));
  await cliente.query(fs.readFileSync('db/seed.sql', 'utf8'));
  await cliente.end();
};

const main = async () => {
  console.log('[pruebas] reiniciando base con semilla...');
  await reiniciarBase();

  const doc = path.join('docs', 'openapi.yaml');
  if (!fs.existsSync(doc)) throw new Error('falta docs/openapi.yaml');

  // ---- A. Documentación viva ----
  let r = await peticion('GET', '/api/docs/');
  evaluar('Documentación', 'Swagger UI responde en GET /api/docs/', 200, r.status);

  // ---- B. Catálogo público ----
  r = await peticion('GET', '/api/productos');
  evaluar('Catálogo', 'GET /api/productos lista productos', 200, r.status);
  evaluar('Catálogo', 'El catálogo sembrado tiene 51 productos', 51, r.datos?.paginacion?.total);

  r = await peticion('GET', '/api/productos?categoria=Bater%C3%ADas&limite=50');
  evaluar('Catálogo', 'Filtro por categoría devuelve 5 baterías', 5, r.datos?.productos?.length);

  r = await peticion('GET', '/api/productos?q=yamaha&limite=50');
  evaluar('Catálogo', 'Búsqueda por nombre/marca/modelo responde 200', 200, r.status);

  r = await peticion('GET', '/api/productos/categorias');
  evaluar('Catálogo', 'GET /api/productos/categorias devuelve 10 categorías', 10, r.datos?.categorias?.length);

  r = await peticion('GET', '/api/productos/9999');
  evaluar('Catálogo', 'Producto inexistente responde 404', 404, r.status);

  r = await peticion('GET', '/api/productos/abc');
  evaluar('Catálogo', 'Identificador no numérico responde 400', 400, r.status);

  // ---- C. Registro ----
  const cuenta = {
    nombre: 'María Pérez',
    email: 'maria@ejemplo.cl',
    password: 'clave12345',
    telefono: '+56 9 4444 4444',
  };
  r = await peticion('POST', '/api/auth/register', { cuerpo: cuenta });
  evaluar('Registro', 'Registro válido responde 201', 201, r.status);
  evaluar('Registro', 'El rol asignado por el servidor es Cliente', 'Cliente', r.datos?.usuario?.rol);

  r = await peticion('POST', '/api/auth/register', { cuerpo: cuenta });
  evaluar('Registro', 'Email ya registrado responde 409', 409, r.status);

  r = await peticion('POST', '/api/auth/register', {
    cuerpo: { ...cuenta, email: 'otro@ejemplo.cl', password: '123' },
  });
  evaluar('Registro', 'Contraseña corta rechazada con 400', 400, r.status);

  // ---- D. Login y JWT ----
  r = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'demo@sonidovivo.cl', password: 'demo123' },
  });
  evaluar('Login', 'Credenciales válidas responden 200 con token', 200, r.status);
  const tokenCliente = r.datos?.token;
  evaluar('Login', 'La respuesta incluye el token y su vencimiento', true, Boolean(tokenCliente && r.datos?.expiraEn));

  const rPasswordMala = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'demo@sonidovivo.cl', password: 'incorrecta' },
  });
  evaluar('Login', 'Contraseña incorrecta responde 401', 401, rPasswordMala.status);

  const rEmailInexistente = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'nadie@ejemplo.cl', password: 'incorrecta' },
  });
  evaluar('Login', 'Email inexistente responde 401', 401, rEmailInexistente.status);
  evaluar('Login', 'Mismo mensaje genérico no revela si el email existe', true,
    rPasswordMala.datos?.error === rEmailInexistente.datos?.error);

  r = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'no-es-correo', password: 'demo123' },
  });
  evaluar('Login', 'Email con formato inválido responde 400', 400, r.status);

  r = await peticion('GET', '/api/auth/me', { token: tokenCliente });
  evaluar('Sesión', 'GET /api/auth/me con token válido responde 200', 200, r.status);
  evaluar('Sesión', 'El usuario de la sesión es Cliente Demo', 'demo@sonidovivo.cl', r.datos?.usuario?.email);

  r = await peticion('GET', '/api/auth/me');
  evaluar('Sesión', 'Petición sin token responde 401', 401, r.status);

  const tokenAlterado = tokenCliente.slice(0, -1) + (tokenCliente.slice(-1) === 'x' ? 'y' : 'x');
  r = await peticion('GET', '/api/auth/me', { token: tokenAlterado });
  evaluar('Sesión', 'Token alterado (firma inválida) responde 401', 401, r.status);

  const tokenVencido = jwt.sign(
    { sub: '3', email: 'demo@sonidovivo.cl', nombre: 'Cliente Demo', rol: 'Cliente' },
    process.env.JWT_SECRET,
    { expiresIn: '1ms', issuer: 'sonido-vivo', audience: 'sonido-vivo-api' }
  );
  await new Promise((resolucion) => setTimeout(resolucion, 50));
  r = await peticion('GET', '/api/auth/me', { token: tokenVencido });
  evaluar('Sesión', 'Token expirado responde 401', 401, r.status);

  const datosToken = { sub: '3', email: 'demo@sonidovivo.cl', nombre: 'Cliente Demo', rol: 'Cliente' };

  const tokenEmisorIncorrecto = jwt.sign(datosToken, process.env.JWT_SECRET, {
    expiresIn: '10m',
    issuer: 'otro-emisor',
    audience: 'sonido-vivo-api',
  });
  r = await peticion('GET', '/api/auth/me', { token: tokenEmisorIncorrecto });
  evaluar('Sesión', 'Token con emisor (iss) incorrecto responde 401', 401, r.status);

  const tokenSinDestino = jwt.sign(datosToken, process.env.JWT_SECRET, {
    expiresIn: '10m',
    issuer: 'sonido-vivo',
  });
  r = await peticion('GET', '/api/auth/me', { token: tokenSinDestino });
  evaluar('Sesión', 'Token sin destinatario (aud) responde 401', 401, r.status);

  const codificar = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const tokenAlgoritmoNone = `${codificar({ alg: 'none', typ: 'JWT' })}.${codificar({
    ...datosToken,
    iss: 'sonido-vivo',
    aud: 'sonido-vivo-api',
  })}.`;
  r = await peticion('GET', '/api/auth/me', { token: tokenAlgoritmoNone });
  evaluar('Sesión', 'Token con algoritmo "none" rechazado con 401', 401, r.status);

  r = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'maria@ejemplo.cl', password: 'clave12345' },
  });
  evaluar('Registro', 'La cuenta recién creada puede iniciar sesión', 200, r.status);

  // ---- E. Roles y stock ----
  r = await peticion('PUT', '/api/productos/1/stock', {
    cuerpo: { tipo: 'ENTRADA', cantidad: 1 },
  });
  evaluar('Stock', 'PUT stock sin token responde 401', 401, r.status);

  r = await peticion('PUT', '/api/productos/1/stock', {
    token: tokenCliente,
    cuerpo: { tipo: 'ENTRADA', cantidad: 1 },
  });
  evaluar('Stock', 'Cliente sin rol vendedor responde 403', 403, r.status);

  const rVendedor = await peticion('POST', '/api/auth/login', {
    cuerpo: { email: 'vendedor@sonidovivo.cl', password: 'demo123' },
  });
  const tokenVendedor = rVendedor.datos?.token;

  const clienteDb = new pg.Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await clienteDb.connect();
  const idGa001 = await clienteDb.query(`SELECT id_producto FROM producto WHERE sku = 'GA001'`);
  const productoPrueba = idGa001.rows[0].id_producto;

  r = await peticion('GET', `/api/productos/${productoPrueba}`);
  const stockInicial = r.datos?.producto?.stock;

  r = await peticion('PUT', `/api/productos/${productoPrueba}/stock`, {
    token: tokenVendedor,
    cuerpo: { tipo: 'SALIDA', cantidad: 2, motivo: 'Venta en tienda' },
  });
  evaluar('Stock', 'Vendedor ajusta stock GA001 (SALIDA 2) con 200', 200, r.status);
  evaluar('Stock', 'El stock resultante es el anterior menos 2', stockInicial - 2, r.datos?.movimiento?.stockResultante);

  r = await peticion('PUT', `/api/productos/${productoPrueba}/stock`, {
    token: tokenVendedor,
    cuerpo: { tipo: 'SALIDA', cantidad: 9999 },
  });
  evaluar('Stock', 'SALIDA mayor que el stock responde 409 (conflicto de negocio)', 409, r.status);

  r = await peticion('PUT', `/api/productos/${productoPrueba}/stock`, {
    token: tokenVendedor,
    cuerpo: { tipo: 'SALIDA', cantidad: 0 },
  });
  evaluar('Stock', 'cantidad = 0 rechazada con 400', 400, r.status);

  const movimientos = await clienteDb.query(
    'SELECT count(*)::int AS total FROM movimiento_stock WHERE id_producto = $1',
    [productoPrueba]
  );
  await clienteDb.end();
  evaluar('Stock', 'El ajuste quedó registrado en movimiento_stock (auditoría)', 1, movimientos.rows[0].total);

  // ---- F. Manejo general de errores y CORS ----
  r = await peticion('GET', '/api/ruta-que-no-existe');
  evaluar('General', 'Ruta inexistente responde 404 en JSON', 404, r.status);
  evaluar('General', 'El cuerpo del 404 es JSON con mensaje', 'La ruta solicitada no existe.', r.datos?.error);

  r = await peticion('OPTIONS', '/api/productos', {
    cabeceras: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
  });
  evaluar('CORS', 'Preflight desde el origen del frontend (localhost:5173) es aceptado', true,
    r.cabeceras.get('access-control-allow-origin') === 'http://localhost:5173');

  // ---- Registro de evidencia ----
  const ahora = new Date();
  const fecha = ahora.toLocaleString('es-CL', { hour12: false });
  const fallos = resultados.filter((x) => !x.ok);
  const lineas = [];
  lineas.push('Casos de prueba de la API Sonido Vivo - evidencia de ejecución');
  lineas.push(`Fecha: ${fecha}`);
  lineas.push(`Servidor: ${BASE}  (Swagger UI: ${BASE}/api/docs)`);
  lineas.push(`BD reiniciada con db/schema.sql + db/seed.sql antes de ejecutar.`);
  lineas.push('');
  lineas.push('GRUPO        CASO                                                        ESPERADO  OBTENIDO  RESULTADO');
  lineas.push('---------------------------------------------------------------------------------------------------');
  for (const x of resultados) {
    lineas.push(
      `${x.grupo.padEnd(12)} ${x.descripcion.padEnd(58)} ${String(x.esperado).padEnd(9)}  ${String(x.obtenido).padEnd(9)}  ${x.ok ? 'OK' : 'FALLA'}`
    );
  }
  lineas.push('');
  lineas.push(`Total: ${resultados.length} casos | OK: ${resultados.length - fallos.length} | Fallas: ${fallos.length}`);

  fs.mkdirSync(path.join('docs', 'evidencias'), { recursive: true });
  fs.writeFileSync(path.join('docs', 'evidencias', 'casos-prueba-api.txt'), lineas.join('\r\n'), 'utf8');

  for (const x of resultados) {
    console.log(`${x.ok ? '  OK ' : 'FALLA'} [${x.grupo}] ${x.descripcion} → esperado ${x.esperado}, obtenido ${x.obtenido}`);
  }
  console.log(`\nTotal: ${resultados.length} casos | OK: ${resultados.length - fallos.length} | Fallas: ${fallos.length}`);
  console.log('Evidencia guardada en docs/evidencias/casos-prueba-api.txt');
  if (fallos.length > 0) process.exit(1);
};

main().catch((error) => {
  console.error('[pruebas] error:', error.message);
  process.exit(1);
});
