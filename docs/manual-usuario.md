# Manual de usuario - Sonido Vivo

Manual de uso del sistema desplegado para la Evaluación Parcial 3 (EP3).

URL del sistema: `http://52.205.148.200`  
Swagger: `http://52.205.148.200/api/docs`

## 1. Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | `demo@sonidovivo.cl` | `demo123` |
| Vendedor | `vendedor@sonidovivo.cl` | `demo123` |
| Administrador | `admin@sonidovivo.cl` | `demo123` |

## 2. Flujo del cliente

1. Abrir la página de inicio.
2. Iniciar sesión con la cuenta de cliente.
3. Revisar el catálogo y filtrar por categoría o búsqueda.
4. Agregar productos al carrito.
5. Ir a **Tu pedido**, validar datos y confirmar.
6. Revisar el pedido en **Mis pedidos** y abrir su detalle.

Capturas sugeridas:

![Inicio](../../capturas/Screenshot_1.png)
![Login cliente](../../capturas/Screenshot_2.png)
![Catálogo](../../capturas/Screenshot_3.png)
![Carrito](../../capturas/Screenshot_4.png)
![Checkout](../../capturas/Screenshot_5.png)
![Confirmación de pedido](../../capturas/Screenshot_6.png)
![Mis pedidos](../../capturas/Screenshot_7.png)
![Detalle de pedido](../../capturas/Screenshot_8.png)

## 3. Flujo del vendedor

El vendedor puede cambiar el estado de pedidos desde el detalle del pedido, usando su token JWT. En la interfaz actual, el acceso directo al panel de pedidos es `/admin/pedidos`.

1. Iniciar sesión con la cuenta de vendedor.
2. Abrir `/admin/pedidos` o el detalle de un pedido.
3. Cambiar el estado a `DESPACHADO` o `ENTREGADO`.
4. Agregar una observación si corresponde.

## 4. Flujo del administrador

1. Iniciar sesión con la cuenta de administrador.
2. Usar los enlaces `Usuarios`, `Productos` y `Pedidos` del navbar.
3. Crear, editar o desactivar usuarios.
4. Crear, editar, activar o desactivar productos.
5. Ajustar stock desde el panel de productos.
6. Revisar pedidos y cambiar su estado desde el detalle.

Capturas sugeridas:

![Login administrador](../../capturas/Screenshot_9.png)
![Panel de usuarios](../../capturas/Screenshot_10.png)
![Panel de productos](../../capturas/Screenshot_11.png)
![Nuevo producto](../../capturas/Screenshot_12.png)
![Panel de pedidos](../../capturas/Screenshot_13.png)

## 5. API y Swagger

- Swagger: `http://52.205.148.200/api/docs`
- Health: `http://52.205.148.200/api/health`

Para probar rutas protegidas:
1. Ejecutar `POST /api/auth/login`.
2. Copiar el token.
3. Usar `Authorize` con `Bearer <token>`.

Capturas sugeridas:

![Swagger](../../capturas/Screenshot_14.png)
![Health](../../capturas/Screenshot_15.png)
![DevTools Network](../../capturas/Screenshot_16.png)

## 6. Solución de problemas

- Si el catálogo no carga, verificar `/api/productos?limite=50`.
- Si el login falla, verificar que el frontend use `/api` y limpiar caché.
- Si una página admin queda en blanco, revisar la consola del navegador.
- Si el backend no responde, verificar `sudo systemctl status sonido-vivo` y `sudo nginx -t`.
