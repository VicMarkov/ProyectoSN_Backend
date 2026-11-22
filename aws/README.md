# Guía 18 — Sonido Vivo: RDS + EC2 + Lambda

Material de apoyo para el laboratorio y el informe técnico. **No contiene
credenciales**: todas las contraseñas se configuran como variables de entorno
en el servidor o en la consola de Lambda.

## Estructura

```
aws/
├── sql/crear_producto.sql      Tabla entidad producto + registros de prueba
├── ec2/                        Backend Express para EC2 (misma estructura de la guía)
│   ├── server.js
│   ├── package.json
│   ├── .env.example            Plantilla de credenciales (copiar al servidor, no al repo)
│   └── src/{app.js, config/rds.js, routes/, controllers/}
├── lambda/
│   ├── index.mjs               Handler con GET/POST /productos sobre la misma RDS
│   └── package.json
└── README.md                   Este archivo
```

## 1. RDS (consola AWS Academy)

1. **RDS → Databases → Create database → Standard create → PostgreSQL**
   (versión 16.x), identificador `sonido-vivo`, usuario `admin`, contraseña
   generada (guardarla en un lugar seguro, **nunca en el repositorio**).
2. Clase `db.t3.micro`, almacenamiento 20 GiB, **Public access: No**.
3. VPC por defecto del laboratorio; subredes privadas; crear grupo de
   seguridad `sg-rds` con regla de entrada **TCP 5432** cuyo origen sea los
   grupos de seguridad `sg-ec2` y `sg-lambda` (no `0.0.0.0/0`).
4. Crear la base `sonido_vivo` y ejecutar `sql/crear_producto.sql` en el
   Query Editor.

## 2. EC2 (Express + pg)

```bash
# En la instancia Ubuntu (VS Code Remote-SSH)
sudo apt update && sudo apt install -y nodejs npm
mkdir -p ~/sonido-vivo-ec2 && cd ~/sonido-vivo-ec2
# copiar el contenido de aws/ec2/ (scp o arrastrar en VS Code)
npm install
cp .env.example .env   # editar valores reales y ocultar
chmod 600 .env
npm start              # API en el puerto 3000
```

- Grupo de seguridad de EC2: entrada **TCP 3000** con origen *My IP*.
- Prueba local: `curl -i "http://localhost:3000/api/productos"`
- Prueba Postman: `GET http://IP_PUBLICA_EC2:3000/api/productos`

## 3. Lambda (misma RDS)

1. **Lambda → Create function → Desde cero**, nombre
   `sonido-vivo-rds-lambda`, Node.js 24.x, rol personalizado **LabRole**.
2. Pegar `lambda/index.mjs` y desplegar.
3. **Variables de entorno** (consola): `RDS_HOST`, `RDS_PORT`, `RDS_DB`,
   `RDS_USER`, `RDS_PASSWORD` (mismos valores que en EC2).
4. **Configuración → VPC**: misma VPC, subredes privadas (2 AZ) y grupo de
   seguridad `sg-lambda` con salida TCP 5432 hacia `sg-rds`.
5. Empaquetar `pg`:
   ```bash
   cd lambda/
   npm install pg --omit=dev
   zip -r function.zip index.mjs node_modules package.json
   ```
   Subir `function.zip` (Código → Cargar desde → .zip file).
6. Probar con el evento `{"rawPath":"/productos","requestContext":{"http":{"method":"GET"}}}`
   y opcionalmente con **Function URL** (autorización NONE) en Postman:
   `GET https://TU_FUNCTION_URL.lambda-url.us-east-1.on.aws/productos`

## 4. Validación cruzada

1. `POST /api/productos` desde Postman a **EC2** (crear SKU `LAM001`).
2. `GET /productos` desde Postman a **Lambda** → debe aparecer `LAM001`.
3. `POST /productos` desde **Lambda** y verificarlo con `GET` en **EC2**.

Ambos backends apuntan al mismo RDS si comparten `RDS_HOST` y `RDS_DB`.

## 5. Al terminar

Detener `npm start`, cerrar la terminal, cerrar reglas temporales de puerto
3000 y **eliminar la instancia RDS** si el laboratorio terminó (no dejar
recursos cobrando).
