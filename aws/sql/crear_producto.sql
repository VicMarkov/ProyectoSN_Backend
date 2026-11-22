-- Tabla de la entidad PRODUCTO del proyecto Sonido Vivo
-- Se crea en Amazon RDS PostgreSQL desde el Query Editor o psql.
-- No incluye contraseñas: las credenciales se gestionan fuera de este archivo.

CREATE TABLE IF NOT EXISTS producto (
    id_producto   SERIAL PRIMARY KEY,
    sku           VARCHAR(20)  NOT NULL UNIQUE,
    nombre        VARCHAR(120) NOT NULL,
    precio        NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock         INTEGER      NOT NULL DEFAULT 0 CHECK (stock >= 0),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_producto_sku ON producto (sku);

INSERT INTO producto (sku, nombre, precio, stock) VALUES
    ('GA001', 'Guitarra Acústica Folk',      129990, 8),
    ('BT001', 'Batería Acústica Básica',     199990, 5),
    ('KB001', 'Teclado Musical 61 Teclas',    89990, 12)
ON CONFLICT (sku) DO NOTHING;

-- Verificación
SELECT id_producto, sku, nombre, precio, stock
FROM producto
ORDER BY id_producto;
