## 11. Estado EP3 y despliegue (actualizado)

### 11.1 Alcance implementado

El backend ya cubre el bloque EP3:

- Autenticación JWT con registro, login y consulta de sesión.
- Catálogo público con filtros, paginación, categorías y marcas.
- CRUD completo de productos para administrador, incluyendo activación/desactivación.
- Ajuste de stock transaccional con auditoría en `movimiento_stock`.
- CRUD de usuarios para administrador, con roles y protección del último administrador activo.
- Pedidos: creación transaccional, listado con paginación, detalle con historial y cambio de estado.
- Permisos por rol (`Administrador`, `Vendedor`, `Cliente`) y anti-IDOR en pedidos.
- Health check y documentación OpenAPI/Swagger.

### 11.2 Despliegue en EC2 + RDS

- Backend: `~/sonido-vivo-backend` en la EC2 (`ubuntu@54.198.104.140`).
- Base de datos: RDS PostgreSQL `sonidovivo`.
- Proceso Node: servicio systemd `sonido-vivo`, reinicio automático.
- Frontend: build estático en `/var/www/sonido-vivo`.
- Proxy: nginx en puerto 80, same-origin, `/api` hacia `127.0.0.1:3000`.
- URLs públicas:
  - Frontend: `http://54.198.104.140`
  - API/Swagger: `http://54.198.104.140/api/docs`
  - Health: `http://54.198.104.140/api/health`

### 11.3 Variables de entorno en EC2

El archivo `~/sonido-vivo-backend/.env` contiene:

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
CORS_ORIGINS=http://54.198.104.140
RATE_LIMIT_MAX=50
```

No se versionan secretos. Antes de una entrega final se recomienda rotar la contraseña RDS y actualizar solo el `.env` de EC2.

### 11.4 Verificación realizada

- `npm run db:check`: conexión OK a RDS.
- `npm run db:setup`: esquema y semilla aplicados (`51 productos`, `10 categorías`, `26 marcas`, `3 usuarios`, `3 roles`).
- Health externo: `{"estado":"ok","baseDatos":"conectada"}`.
- Login admin y cliente: OK.
- Catálogo, usuarios, productos y pedidos: OK.
- Swagger UI: HTTP 200.
- Frontend: HTTP 200.
- Pruebas backend: `37/37` OK.
- Pruebas frontend: `137/138` OK, con 1 fallo intencional de la rúbrica.

### 11.5 Evidencias

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
