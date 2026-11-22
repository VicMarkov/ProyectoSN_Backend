# Inicialización y arranque - Sonido Vivo

Guía paso a paso para levantar el proyecto completo en otro equipo y verificar que frontend y backend funcionan.

## 1. Requisitos

- Node.js 22 o superior.
- npm.
- Git.
- Puertos libres: `3000` para backend y `5173` para frontend.

## 2. Clonar repositorios

```bash
git clone https://github.com/VicMarkov/ProyectoSN_Backend.git
git clone https://github.com/VicMarkov/ProyectoSN.git
```

## 3. Backend local

```bash
cd ProyectoSN_Backend
npm install
cp .env.example .env
```

El archivo `.env` local debe quedar así:

```text
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=sonido_vivo
PGUSER=sonido
PGPASSWORD=sonido123
JWT_SECRET=cambia-esta-clave-por-una-aleatoria-larga
JWT_EXPIRES_IN=1h
CORS_ORIGINS=http://localhost:5173
RATE_LIMIT_MAX=50
```

En terminal 1, levantar PostgreSQL embebido:

```bash
npm run db:start
```

En terminal 2, crear esquema y semilla:

```bash
npm run db:setup
```

En terminal 3, levantar la API:

```bash
npm start
```

Verificaciones locales:

```bash
curl http://localhost:3000/api/health
```

- Swagger UI: `http://localhost:3000/api/docs`
- Health esperado: `{"estado":"ok","baseDatos":"conectada"}`

Pruebas backend:

```bash
npm run pruebas:api
```

Requiere `npm run db:start` y `npm start` activos. Resultado esperado: `37 casos | OK: 37 | Fallas: 0`.

## 4. Frontend local

```bash
cd ProyectoSN/frontend-react
npm install
```

Crear `frontend-react/.env`:

```text
VITE_API_URL=http://localhost:3000/api
```

Levantar frontend:

```bash
npm run dev
```

Abrir:

```text
http://localhost:5173
```

Pruebas frontend:

```bash
npm run test:run
```

Resultado esperado: `137` pruebas en verde y `1` fallo intencional de la rúbrica.

Build de producción:

```bash
npm run build
```

## 5. Credenciales de prueba

- Administrador: `admin@sonidovivo.cl` / `demo123`
- Vendedor: `vendedor@sonidovivo.cl` / `demo123`
- Cliente: `demo@sonidovivo.cl` / `demo123`

## 6. Verificación funcional

1. Iniciar sesión con `demo@sonidovivo.cl`.
2. Revisar catálogo: deben aparecer 51 productos.
3. Agregar productos al carrito.
4. Confirmar pedido.
5. Revisar `Mis pedidos` y detalle del pedido.
6. Iniciar sesión con `admin@sonidovivo.cl`.
7. Probar administración de usuarios, productos y pedidos.
8. Abrir DevTools → Network y confirmar llamadas a `/api/...`.

## 7. Despliegue actual

Frontend:

```text
http://3.211.234.101
```

API y Swagger:

```text
http://3.211.234.101/api/docs
```

Health:

```text
http://3.211.234.101/api/health
```

En EC2, verificar servicios:

```bash
sudo systemctl status sonido-vivo
sudo nginx -t
curl http://127.0.0.1:3000/api/health
curl http://3.211.234.101/api/health
```

Si la base está vacía, aplicar esquema y semilla:

```bash
cd ~/sonido-vivo-backend
npm run db:check
npm run db:setup
sudo systemctl restart sonido-vivo
```

## 8. Solución de problemas

- **Catálogo vacío:** verificar que backend permita `limite=100` y que el frontend use `/api/productos?limite=100`.
- **Login falla en navegador:** verificar `VITE_API_URL=/api` en build desplegado y limpiar caché con Ctrl+F5.
- **CORS:** verificar `CORS_ORIGINS` en `.env`.
- **Backend no conecta a RDS:** verificar regla inbound TCP `5432` en el security group de RDS para la EC2.
- **Página en blanco en admin:** verificar que las respuestas de `/api/usuarios`, `/api/productos/admin` y `/api/pedidos` sean arrays y no objetos.
- **Servicio caído:** reiniciar con `sudo systemctl restart sonido-vivo`.
