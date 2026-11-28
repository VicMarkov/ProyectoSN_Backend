# Documento de integración - Sonido Vivo

Documento técnico de integración entre frontend React y backend Node.js/Express para la EP3.

## 1. Arquitectura

```text
React (Vite) -> Axios -> Nginx (puerto 80) -> Express (127.0.0.1:3000) -> PostgreSQL/RDS
```

- Frontend: React 19 + Vite.
- Backend: Node.js + Express 5.
- Base de datos: PostgreSQL 16, local con `embedded-postgres` y RDS en despliegue.
- Autenticación: JWT HS256 con vigencia de 1 hora.
- Documentación: OpenAPI/Swagger en `/api/docs`.

## 2. Modelo de datos

Entidades principales:

- `ROL`
- `USUARIO`
- `CATEGORIA`
- `MARCA`
- `PRODUCTO`
- `CARRITO`
- `CARRITO_DETALLE`
- `PEDIDO`
- `PEDIDO_DETALLE`
- `HISTORIAL_ESTADO_PEDIDO`
- `MOVIMIENTO_STOCK`
- `CONTACTO_MENSAJE`

Restricciones relevantes:

- `UNIQUE`: email, SKU, categoría, marca, número de pedido y producto por carrito.
- `CHECK`: estados, tipos de entrega, tipos de movimiento, precios, stocks y cantidades.
- `FOREIGN KEY` en todas las relaciones.
- Borrado lógico en usuarios, productos y categorías.
- Auditoría de stock en `movimiento_stock`.

## 3. Endpoints utilizados

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Catálogo

- `GET /api/productos`
- `GET /api/productos/{id}`
- `GET /api/productos/categorias`
- `GET /api/productos/marcas`

### Productos (administrador)

- `GET /api/productos/admin`
- `POST /api/productos`
- `PUT /api/productos/{id}`
- `PATCH /api/productos/{id}/estado`
- `DELETE /api/productos/{id}`
- `PUT /api/productos/{id}/stock`

### Usuarios (administrador)

- `GET /api/usuarios`
- `GET /api/usuarios/roles`
- `POST /api/usuarios`
- `PUT /api/usuarios/{id}`
- `PATCH /api/usuarios/{id}/estado`
- `PATCH /api/usuarios/{id}/password`
- `DELETE /api/usuarios/{id}`

### Pedidos

- `GET /api/pedidos`
- `POST /api/pedidos`
- `GET /api/pedidos/{id}`
- `PATCH /api/pedidos/{id}/estado`

### Sistema

- `GET /api/health`

## 4. Integración frontend

Servicios:

- `src/services/api.js`: instancia Axios, token, interceptores y `ApiError`.
- `src/services/auth.js`: login, registro y sesión.
- `src/services/productos.js`: catálogo y administración.
- `src/services/usuarios.js`: usuarios y roles.
- `src/services/pedidos.js`: pedidos.

DTOs:

- `src/dto/usuario.dto.js`
- `src/dto/producto.dto.js`
- `src/dto/pedido.dto.js`

Flujos integrados:

- Login con JWT y sesión persistente.
- Registro con recarga a login.
- Catálogo desde API.
- Checkout que crea pedidos reales.
- Mis pedidos y detalle.
- Administración de usuarios, productos y pedidos.
- Rutas protegidas por rol.

## 5. Pruebas y resultados

### Backend

- Comando: `npm run pruebas:api`
- Resultado: 37 casos, 37 OK, 0 fallas.
- Evidencia: `docs/evidencias/casos-prueba-api.txt`

### Frontend

- Comando: `npm run test:run`
- Resultado: 137 casos en verde y 1 fallo intencional de la rúbrica.
- Build: `npm run build` exitoso.

## 6. Despliegue

- Frontend: `http://52.205.148.200`
- API/Swagger: `http://52.205.148.200/api/docs`
- Health: `http://52.205.148.200/api/health`
- Backend: servicio systemd `sonido-vivo`.
- Proxy: nginx en puerto 80.
- Base de datos: RDS PostgreSQL `sonidovivo`.

## 7. Evidencias

Archivos guardados en `backend/docs/evidencias/`:

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

Capturas manuales en `capturas/`:

- `Screenshot_1.png` a `Screenshot_16.png`

## 8. Pendientes

- Carrito persistente en backend.
- Endpoint y formulario de contacto.
- HTTPS.
- Refresh/revocación de tokens.
- Pruebas automatizadas para páginas admin.
