-- Esquema Sonido Vivo - Proyecto semestral DSY1104
-- Traducción a PostgreSQL del diagrama entidad-relación
-- (docs/diagrama_entidad_relacion.svg): 12 entidades con PK, FK, UK,
-- enums con CHECK y reglas de integridad referencial.

-- ============ ROL ============
CREATE TABLE rol (
    id_rol       SERIAL PRIMARY KEY,
    nombre       VARCHAR(30)  NOT NULL UNIQUE,
    descripcion  VARCHAR(120)
);

-- ============ USUARIO ============
CREATE TABLE usuario (
    id_usuario      SERIAL PRIMARY KEY,
    nombre          VARCHAR(80)  NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(100) NOT NULL,
    telefono        VARCHAR(20),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP    NOT NULL DEFAULT now(),
    id_rol          INT          NOT NULL REFERENCES rol (id_rol)
);

-- ============ CATEGORIA / MARCA ============
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre       VARCHAR(60)  NOT NULL UNIQUE,
    descripcion  VARCHAR(200),
    activo       BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE marca (
    id_marca SERIAL PRIMARY KEY,
    nombre   VARCHAR(60) NOT NULL UNIQUE
);

-- ============ PRODUCTO ============
CREATE TABLE producto (
    id_producto       SERIAL PRIMARY KEY,
    sku               VARCHAR(20)   NOT NULL UNIQUE,
    nombre            VARCHAR(120)  NOT NULL,
    modelo            VARCHAR(60),
    descripcion       TEXT,
    precio            DECIMAL(12,2) NOT NULL CHECK (precio >= 0),
    stock             INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo      INT           NOT NULL DEFAULT 3 CHECK (stock_minimo >= 0),
    id_categoria      INT           NOT NULL REFERENCES categoria (id_categoria),
    id_marca          INT           NOT NULL REFERENCES marca (id_marca),
    activo            BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion    TIMESTAMP     NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP   NOT NULL DEFAULT now()
);

-- ============ CARRITO ============
CREATE TABLE carrito (
    id_carrito        SERIAL PRIMARY KEY,
    id_usuario        INT NOT NULL REFERENCES usuario (id_usuario) ON DELETE CASCADE,
    fecha_creacion    TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE carrito_detalle (
    id_carrito_detalle SERIAL PRIMARY KEY,
    id_carrito         INT NOT NULL REFERENCES carrito (id_carrito) ON DELETE CASCADE,
    id_producto        INT NOT NULL REFERENCES producto (id_producto),
    cantidad           INT NOT NULL CHECK (cantidad > 0),
    fecha_agregado     TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (id_carrito, id_producto)
);

-- ============ PEDIDO ============
CREATE TABLE pedido (
    id_pedido          SERIAL PRIMARY KEY,
    numero_pedido      VARCHAR(20) NOT NULL UNIQUE,
    id_usuario         INT NOT NULL REFERENCES usuario (id_usuario),
    fecha_creacion     TIMESTAMP NOT NULL DEFAULT now(),
    estado             VARCHAR(20) NOT NULL DEFAULT 'EN_PREPARACION'
                       CHECK (estado IN ('EN_PREPARACION', 'DESPACHADO', 'ENTREGADO')),
    tipo_entrega       VARCHAR(20) NOT NULL
                       CHECK (tipo_entrega IN ('DOMICILIO', 'RETIRO_TIENDA')),
    nombre_contacto    VARCHAR(80)  NOT NULL,
    email_contacto     VARCHAR(120) NOT NULL,
    telefono_contacto  VARCHAR(20)  NOT NULL,
    direccion_despacho VARCHAR(160),
    subtotal           DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    costo_envio        DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (costo_envio >= 0),
    total              DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT chk_direccion CHECK (tipo_entrega <> 'DOMICILIO' OR direccion_despacho IS NOT NULL)
);

CREATE TABLE pedido_detalle (
    id_pedido_detalle SERIAL PRIMARY KEY,
    id_pedido         INT NOT NULL REFERENCES pedido (id_pedido) ON DELETE CASCADE,
    id_producto       INT NOT NULL REFERENCES producto (id_producto),
    cantidad          INT NOT NULL CHECK (cantidad > 0),
    precio_unitario   DECIMAL(12,2) NOT NULL,
    subtotal          DECIMAL(12,2) NOT NULL,
    nombre_producto   VARCHAR(120) NOT NULL
);

CREATE TABLE historial_estado_pedido (
    id_historial    SERIAL PRIMARY KEY,
    id_pedido       INT NOT NULL REFERENCES pedido (id_pedido) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo    VARCHAR(20) NOT NULL
                    CHECK (estado_nuevo IN ('EN_PREPARACION', 'DESPACHADO', 'ENTREGADO')),
    fecha_cambio    TIMESTAMP NOT NULL DEFAULT now(),
    id_usuario      INT REFERENCES usuario (id_usuario),
    observacion     VARCHAR(200)
);

-- ============ MOVIMIENTO_STOCK ============
CREATE TABLE movimiento_stock (
    id_movimiento     SERIAL PRIMARY KEY,
    id_producto       INT NOT NULL REFERENCES producto (id_producto),
    tipo              VARCHAR(10) NOT NULL
                      CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad          INT NOT NULL CHECK (cantidad > 0),
    stock_resultante  INT NOT NULL CHECK (stock_resultante >= 0),
    motivo            VARCHAR(120),
    fecha             TIMESTAMP NOT NULL DEFAULT now(),
    id_usuario        INT REFERENCES usuario (id_usuario),
    id_pedido         INT REFERENCES pedido (id_pedido)
);

-- ============ CONTACTO_MENSAJE ============
CREATE TABLE contacto_mensaje (
    id_contacto   SERIAL PRIMARY KEY,
    id_usuario    INT REFERENCES usuario (id_usuario),
    nombre        VARCHAR(80)  NOT NULL,
    email         VARCHAR(120) NOT NULL,
    telefono      VARCHAR(20),
    tipo_consulta VARCHAR(15) NOT NULL
                  CHECK (tipo_consulta IN ('STOCK', 'REPARACION', 'OTRA')),
    mensaje       TEXT NOT NULL,
    fecha_envio   TIMESTAMP NOT NULL DEFAULT now(),
    estado        VARCHAR(15) NOT NULL DEFAULT 'NUEVO'
                  CHECK (estado IN ('NUEVO', 'LEIDO', 'RESPONDIDO'))
);

-- ============ ÍNDICES de apoyo ============
CREATE INDEX idx_producto_categoria ON producto (id_categoria);
CREATE INDEX idx_producto_marca ON producto (id_marca);
CREATE INDEX idx_pedido_usuario ON pedido (id_usuario);
CREATE INDEX idx_movimiento_producto ON movimiento_stock (id_producto);
CREATE INDEX idx_carrito_usuario ON carrito (id_usuario);
