# API REST Sonido Vivo - Backend

Repositorio del **backend del proyecto semestral Sonido Vivo** (tienda de
instrumentos musicales y equipos de sonido, Viña del Mar), curso
**DSY1104 - Desarrollo FullStack II**, Duoc UC.

- Integrante: **Vicente Markov** (equipo de un integrante).
- Repositorio del frontend: <https://github.com/VicMarkov/ProyectoSN>
- Swagger UI local: <http://localhost:3000/api/docs>
- Despliegue actual: <http://52.205.148.200>
- Swagger desplegado: <http://52.205.148.200/api/docs>

---

## 1. Identificación y alcance

**Caso de negocio:** Sonido Vivo necesita migrar su tienda desde la simulación
del Parcial 1 hacia una solución con API REST y base de datos, manteniendo el
catálogo, la autenticación de usuarios, la gestión de stock y el flujo de
pedidos.

**Qué cubre el backend en la EP3:**

| Área | Alcance |
|---|---|
| Autenticación | Registro de clientes, inicio de sesión con JWT y consulta de la sesión vigente (`/api/auth/me`) |
| Catálogo | Listado paginado con filtro por categoría y búsqueda, detalle de producto, categorías y marcas |
| Productos | CRUD completo para administrador, activación/desactivación y ajuste de stock |
| Usuarios | CRUD completo para administrador, roles, activación/desactivación y restablecimiento de contraseña |
| Pedidos | Creación transaccional, listado, detalle con historial y cambio de estado |
| Stock | Ajuste de stock (entrada / salida / ajuste) con roles, transacción y auditoría en `movimiento_stock` |
| Seguridad | Hash bcrypt de contraseñas, tokens con vigencia, roles, rate limit, CORS, validación en el servidor |
| Documentación | OpenAPI 3.0 + Swagger UI, guía de inicialización y evidencias de pruebas |
| Despliegue | Express en EC2, PostgreSQL en RDS y frontend servido con nginx |

**Pendientes de implementar:** carrito persistente en backend, mensajes de
contacto y refresh/revocación de tokens. El contrato de esos recursos está
especificado en `docs/openapi.yaml`.

---

## 2. Referencia al frontend

- Frontend (React 19 + Vite): <https://github.com/VicMarkov/ProyectoSN>
  (carpeta `frontend-react/`).
- El frontend consume la API mediante Axios y DTOs.
- Flujos integrados: login, registro, catálogo, carrito/checkout, mis pedidos,
  detalle de pedido y administración de usuarios/productos/pedidos.

---

## 3. Decisiones técnicas

| Decisión | Elección | Justificación |
|---|---|---|
| Tecnología backend | **Node.js 24 + Express 5** | Base común de lenguaje con el frontend, arranque simple y despliegue directo en EC2. |
| Ejecución | **EC2** | Control total del proceso Express y conexión persistente a PostgreSQL. |
| Base de datos | **PostgreSQL 16 local** con `embedded-postgres` y **RDS PostgreSQL** en despliegue | Mismo motor en desarrollo y producción, evitando migraciones. |
| Autenticación | **JWT (HS256) con vigencia de 1 hora** | Flujo simple para esta fase; el token incluye `sub`, `email`, `nombre`, `rol`, `iss` y `aud`. |
| API docs | **OpenAPI 3.0 + Swagger UI** | Documentación viva y comprobable desde el navegador. |
| Integración frontend | **Axios + DTOs** | Centraliza llamadas HTTP, manejo de errores, token y normalización de datos. |

El archivo `.env` está en `.gitignore`: **no se versionan secretos**.
`.env.example` documenta la configuración sin valores reales.

---

## 4. Diseño de datos

El modelo tiene **12 entidades**:

| Entidad | Rol en el modelo |
|---|---|
| `ROL` | Catálogo de roles: Administrador, Vendedor, Cliente |
| `USUARIO` | Cuentas con `password_hash`, `activo` y FK a `ROL` |
| `CARRITO`, `CARRITO_DETALLE` | Carrito de un usuario con sus líneas |
| `PRODUCTO` | Catálogo: SKU único, precio, stock, stock mínimo, FK a categoría y marca |
| `CATEGORIA`, `MARCA` | Clasificación del catálogo |
| `PEDIDO` | Cabecera: número único, estado, tipo de entrega, totales |
| `PEDIDO_DETALLE` | Líneas con cantidad, precio unitario y snapshot de `nombre_producto` |
| `HISTORIAL_ESTADO_PEDIDO` | Trazabilidad de cambios de estado |
| `MOVIMIENTO_STOCK` | Auditoría de stock: tipo, stock resultante y usuario |
| `CONTACTO_MENSAJE` | Mensajes del formulario de contacto |

Restricciones principales:

- `UNIQUE`: `usuario.email`, `producto.sku`, `categoria.nombre`, `marca.nombre`,
  `pedido.numero_pedido` y `(id_carrito, id_producto)`.
- `CHECK`: estados de pedido, tipo de entrega, tipo de movimiento, precios,
  stocks y cantidades.
- `FOREIGN KEY` en todas las relaciones relevantes.
- Borrado lógico en `usuario`, `producto` y `categoria`.
- Auditoría de stock en `movimiento_stock`.

Datos de prueba iniciales:

- Roles: Administrador, Vendedor, Cliente.
- Usuarios: `admin@sonidovivo.cl`, `vendedor@sonidovivo.cl`,
  `demo@sonidovivo.cl`, todos con contraseña `demo123`.
- Catálogo: 10 categorías, 26 marcas y 51 productos.

---

## 5. Organización y responsabilidades

| Capa | Responsabilidad | Archivos |
|---|---|---|
| `routes/` | Contrato HTTP, validación y seguridad | `auth.routes.js`, `productos.routes.js`, `usuarios.routes.js`, `pedidos.routes.js`, `index.js` |
| `controllers/` | Recibir request, llamar al servicio y armar response | `auth.controller.js`, `productos.controller.js`, `usuarios.controller.js`, `pedidos.controller.js` |
| `services/` | Reglas de negocio, JWT, transacciones | `auth.service.js`, `productos.service.js`, `usuarios.service.js`, `pedidos.service.js` |
| `repositories/` | SQL | `usuarios.repo.js`, `productos.repo.js`, `pedidos.repo.js` |
| `dto/` | Normalización de requests y responses | `usuario.dto.js`, `producto.dto.js`, `pedido.dto.js` |
| `middleware/` | Autenticación, roles, validación y errores | `auth.middleware.js`, `validacion.middleware.js`, `error.middleware.js` |
| `validators/` | Reglas declarativas de express-validator | `auth.validators.js`, `productos.validators.js`, `usuarios.validators.js`, `pedidos.validators.js` |
| `config/` | Pool de conexión según `.env` | `db.js` |
| `scripts/` | Operación de BD y pruebas | `db.mjs`, `db-check.mjs`, `db-setup.mjs`, `reset.mjs`, `smoke.mjs` |

---

## 6. API y documentación viva

### 6.1 Cómo consultarla y probarla

1. Levantar la base: `npm run db:start`
2. Aplicar esquema y semilla: `npm run db:setup`
3. Levantar el servidor: `npm start`
4. Abrir <http://localhost:3000/api/docs>
5. Para rutas protegidas, usar `Authorize` con `Bearer <token>`.

La fuente del contrato es [`docs/openapi.yaml`](docs/openapi.yaml).

### 6.2 Recursos implementados

| Módulo | Rutas principales | Rol requerido |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | Público / autenticado |
| Productos | `GET /api/productos`, `GET /api/productos/{id}`, `GET /api/productos/categorias`, `GET /api/productos/marcas` | Público |
| Productos admin | `GET /api/productos/admin`, `POST /api/productos`, `PUT /api/productos/{id}`, `PATCH /api/productos/{id}/estado`, `DELETE /api/productos/{id}` | Administrador |
| Stock | `PUT /api/productos/{id}/stock` | Vendedor / Administrador |
| Usuarios | `GET /api/usuarios`, `GET /api/usuarios/roles`, `POST /api/usuarios`, `PUT /api/usuarios/{id}`, `PATCH /api/usuarios/{id}/estado`, `PATCH /api/usuarios/{id}/password`, `DELETE /api/usuarios/{id}` | Administrador |
| Pedidos | `GET /api/pedidos`, `POST /api/pedidos`, `GET /api/pedidos/{id}`, `PATCH /api/pedidos/{id}/estado` | Autenticado / Vendedor / Administrador |
| Sistema | `GET /api/health` | Público |

Códigos de estado usados: `200/201` éxito, `400` validación, `401` sin sesión
válida, `403` sin permisos, `404` recurso inexistente, `409` conflicto de
negocio o duplicidad, `429` límite de intentos, `500` error interno.

---

## 7. Seguridad

- Contraseñas con hash bcrypt costo 12.
- JWT firmado con HS256, vigencia de 1 hora, `issuer` y `audience` verificados.
- Roles comprobados en el servidor con `requireRole`.
- Validación de entrada en todas las rutas.
- CORS con orígenes explícitos.
- Rate limit para login.
- Cabecera `X-Powered-by` desactivada y cuerpo JSON limitado a 100 KB.
- No se versionan secretos; `.env` está ignorado por git.

Limitaciones asumidas en esta fase: HTTP en desarrollo, sin refresh/revocación
de tokens y sin rate limit general de la API.

---

## 8. Ejecución y pruebas

### 8.1 Requisitos

- Node.js 20 o superior.
- Conexión a internet la primera vez para `npm install`.
- No requiere instalar PostgreSQL ni Docker.

### 8.2 Pasos reproducibles (local)

```bash
npm install
npm run db:start
npm run db:setup
npm start
```

Modo desarrollo con recarga automática: `npm run dev`.

### 8.3 Configuración (`.env`)

Copia `.env.example` a `.env`. Variables principales:

| Variable | Valor de ejemplo | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto del servidor |
| `PGHOST/PGPORT/PGDATABASE` | `localhost/5432/sonido_vivo` | Base de datos |
| `PGUSER/PGPASSWORD` | `sonido/sonido123` | Usuario local de desarrollo |
| `JWT_SECRET` | *(aleatorio por entorno)* | Firma de los tokens |
| `JWT_EXPIRES_IN` | `1h` | Vigencia del token |
| `CORS_ORIGINS` | `http://localhost:5173` | Orígenes permitidos |
| `RATE_LIMIT_MAX` | `50` | Intentos de login cada 15 minutos |

### 8.4 Cuentas de prueba

| Email | Contraseña | Rol |
|---|---|---|
| `demo@sonidovivo.cl` | `demo123` | Cliente |
| `vendedor@sonidovivo.cl` | `demo123` | Vendedor |
| `admin@sonidovivo.cl` | `demo123` | Administrador |

### 8.5 Pruebas realizadas

Suite: `npm run pruebas:api`

- Última corrida: **37 casos, 37 OK, 0 fallas**.
- Evidencia: [`docs/evidencias/casos-prueba-api.txt`](docs/evidencias/casos-prueba-api.txt).

Pruebas manuales verificadas en despliegue:

- Health: `{"estado":"ok","baseDatos":"conectada"}`.
- Login admin y cliente: OK.
- Catálogo: 51 productos.
- Usuarios, productos y pedidos: OK.
- Swagger UI: HTTP 200.

---

## 9. Despliegue

El backend y el frontend están desplegados en:

- Frontend: <http://52.205.148.200>
- API y Swagger: <http://52.205.148.200/api/docs>
- Health: <http://52.205.148.200/api/health>

Infraestructura:

- EC2 Ubuntu con Node.js.
- Nginx en puerto 80 con proxy `/api` a `127.0.0.1:3000`.
- Servicio systemd `sonido-vivo` con reinicio automático.
- RDS PostgreSQL `sonidovivo`.
- Frontend compilado en `/var/www/sonido-vivo`.

Variables en EC2:

```text
PORT=3000
PGHOST=sonidovivo.cmmcwo5qv38q.us-east-1.rds.amazonaws.com
PGPORT=5432
PGDATABASE=sonidovivo
PGUSER=master
PGPASSWORD=<solo en EC2>
PGSSL=true
JWT_SECRET=<generado en EC2>
JWT_EXPIRES_IN=1h
CORS_ORIGINS=http://52.205.148.200
RATE_LIMIT_MAX=50
```

Guía detallada: [`docs/INICIALIZACION.md`](docs/INICIALIZACION.md) y
[`docs/EP3_DEPLOY.md`](docs/EP3_DEPLOY.md).

---

## 10. Evidencias

Las evidencias de despliegue se guardan en `docs/evidencias/`:

- `01-health.json`
- `02-swagger-status.txt`
- `03-login-admin.json`
- `04-login-cliente.json`
- `05-productos.json`
- `06-categorias.json`
- `07-marcas.json`
- `08-usuarios.json`
- `09-pedidos-cliente.json`
- `10-pedido-detalle.json`
- `11-frontend-index.html`
- `casos-prueba-api.txt`

---

## 11. Estado final

- Backend implementado con autenticación, catálogo, productos, usuarios, stock y pedidos.
- Frontend integrado con Axios y DTOs.
- Despliegue funcional en EC2 y RDS.
- Pruebas backend: `37/37 OK`.
- Pruebas frontend: `137/138 OK` (1 fallo intencional de la rúbrica).
- Pendientes: carrito persistente en backend, contacto, HTTPS y refresh/revocación de tokens.


---

## 13. Manual e integracion

- Manual de usuario: `docs/manual-usuario.md`
- Documento de integracion: `docs/integracion.md`
- Capturas manuales: `capturas/Screenshot_1.png` a `capturas/Screenshot_16.png`
