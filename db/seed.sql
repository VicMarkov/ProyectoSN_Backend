-- Semilla de prueba Sonido Vivo
-- Convierte los datos simulados del frontend (frontend-react/src/data/productos.js,
-- 51 productos de una muestra de 340 referencias) en datos iniciales de la BD.

-- ============ ROLES ============
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
    (1, 'Administrador', 'Gestiona usuarios, productos y todos los pedidos'),
    (2, 'Vendedor',      'Gestiona stock y estados de pedidos del sistema'),
    (3, 'Cliente',       'Compra productos y consulta sus propios pedidos');
SELECT setval(pg_get_serial_sequence('rol', 'id_rol'), (SELECT max(id_rol) FROM rol));

-- ============ USUARIOS DE PRUEBA ============
-- Contraseña de todos: demo123 (hash bcrypt costo 12, línea base OWASP; nunca se guarda en claro)
INSERT INTO usuario (id_usuario, nombre, email, password_hash, telefono, id_rol) VALUES
    (1, 'Administrador Demo', 'admin@sonidovivo.cl',    '$2b$12$teK85tAObXX5dimA/VIO.eOFY6jOlx7gX9g/6aKCVbRevAIBLw.Ki', '+56 9 1111 1111', 1),
    (2, 'Vendedor Demo',      'vendedor@sonidovivo.cl', '$2b$12$teK85tAObXX5dimA/VIO.eOFY6jOlx7gX9g/6aKCVbRevAIBLw.Ki', '+56 9 2222 2222', 2),
    (3, 'Cliente Demo',       'demo@sonidovivo.cl',     '$2b$12$teK85tAObXX5dimA/VIO.eOFY6jOlx7gX9g/6aKCVbRevAIBLw.Ki', '+56 9 3333 3333', 3);
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'), (SELECT max(id_usuario) FROM usuario));

-- ============ CATEGORIAS (derivadas del catálogo) ============
INSERT INTO categoria (id_categoria, nombre) VALUES
    (1,  'Guitarras Acústicas'),
    (2,  'Guitarras Eléctricas'),
    (3,  'Bajos Eléctricos'),
    (4,  'Baterías'),
    (5,  'Teclados y Pianos'),
    (6,  'Amplificadores'),
    (7,  'Micrófonos'),
    (8,  'Pedales de Efectos'),
    (9,  'Accesorios'),
    (10, 'Estudio y Grabación');
SELECT setval(pg_get_serial_sequence('categoria', 'id_categoria'), (SELECT max(id_categoria) FROM categoria));

-- ============ MARCAS (derivadas del catálogo) ============
INSERT INTO marca (id_marca, nombre) VALUES
    (1,  'Yamaha'),
    (2,  'Fender'),
    (3,  'Takamine'),
    (4,  'Squier'),
    (5,  'Epiphone'),
    (6,  'Pearl'),
    (7,  'Roland'),
    (8,  'Zildjian'),
    (9,  'Arturia'),
    (10, 'M-Audio'),
    (11, 'Marshall'),
    (12, 'Hartke'),
    (13, 'Fishman'),
    (14, 'Shure'),
    (15, 'Audio-Tech.'),
    (16, 'Blue'),
    (17, 'Boss'),
    (18, 'MXR'),
    (19, 'Ibanez'),
    (20, 'Ernie Ball'),
    (21, 'Dunlop'),
    (22, 'Snark'),
    (23, 'Monster'),
    (24, 'Hercules'),
    (25, 'Focusrite'),
    (26, 'Sennheiser');
SELECT setval(pg_get_serial_sequence('marca', 'id_marca'), (SELECT max(id_marca) FROM marca));

-- ============ PRODUCTOS (51 del catálogo del frontend) ============
WITH producto_seed (sku, nombre, modelo, descripcion, precio, stock, categoria, marca) AS (VALUES
    ('GA001', 'Guitarra Acústica Folk',            'F310',          'Tapa de abeto, aros y fondo de meranti. Ideal para iniciantes.', 129990, 8,  'Guitarras Acústicas', 'Yamaha'),
    ('GA002', 'Guitarra Acústica Dreadnought',     'CD-60S',        'Tapa de abeto macizo, brazo de caoba. Sonido cálido y proyectado.', 189990, 5, 'Guitarras Acústicas', 'Fender'),
    ('GA003', 'Guitarra Acústica Clásica 4/4',     'C40',           'Nailon, tapa de abeto. Ideal para estudio y flamenco.', 89990, 10, 'Guitarras Acústicas', 'Yamaha'),
    ('GA004', 'Guitarra Electroacústica',          'GN20CE',        'Pickup integrado, afinador incorporado.', 349990, 3, 'Guitarras Acústicas', 'Takamine'),
    ('GA005', 'Guitarra 3/4 Niños',                'JR1',           'Tamaño reducido para niños de 6 a 10 años.', 79990, 6, 'Guitarras Acústicas', 'Yamaha'),
    ('GE001', 'Guitarra Eléctrica Stratocaster',   'Affinity Strat','Cuerpo de álamo, mástil de arce, pastillas SSS.', 249990, 5, 'Guitarras Eléctricas', 'Squier'),
    ('GE002', 'Guitarra Eléctrica Les Paul',       'Les Paul Std',  'Cuerpo caoba, tapa arce, pastillas humbucker.', 329990, 4, 'Guitarras Eléctricas', 'Epiphone'),
    ('GE003', 'Guitarra Eléctrica SG',             'SG Standard',   'Cuerpo caoba, mástil caoba, 2 humbuckers.', 319990, 3, 'Guitarras Eléctricas', 'Epiphone'),
    ('GE004', 'Guitarra Eléctrica Telecaster',     'Affinity Tele', 'Cuerpo álamo, clavijero vintage, 2 pastillas single.', 239990, 4, 'Guitarras Eléctricas', 'Squier'),
    ('GE005', 'Guitarra Eléctrica Semi-hollow',    'ES-335',        'Semi-hueca, 2 humbuckers, ideal para jazz y blues.', 549990, 2, 'Guitarras Eléctricas', 'Epiphone'),
    ('BA001', 'Bajo Eléctrico 4 Cuerdas',          'Affinity PJ',   'Pickup PJ, cuerpo álamo, mástil arce.', 299990, 5, 'Bajos Eléctricos', 'Squier'),
    ('BA002', 'Bajo Eléctrico Jazz Bass',          'Player Jazz',   'Alder body, 2 Alnico V Jazz single-coil.', 699990, 2, 'Bajos Eléctricos', 'Fender'),
    ('BA003', 'Bajo Acústico 4 Cuerdas',           'APX700II',      'Electroacústico, afinador incorporado.', 429990, 2, 'Bajos Eléctricos', 'Yamaha'),
    ('BT001', 'Batería Acústica 5 piezas',         'Roadshow',      'Incluye stands, platillos y pedal de bombo.', 599990, 2, 'Baterías', 'Pearl'),
    ('BT002', 'Batería Electrónica 8 pads',        'TD-02KV',       'Módulo TD-02, 8 pads de goma, pedal hi-hat.', 799990, 2, 'Baterías', 'Roland'),
    ('BT003', 'Caja Snare 14"',                    'STE1450',       'Acero, 14x5", 10 tensores.', 89990, 4, 'Baterías', 'Pearl'),
    ('BT004', 'Platillo Hi-Hat 14"',               'A Series',      'Latón B20, sonido brillante y claro.', 149990, 3, 'Baterías', 'Zildjian'),
    ('BT005', 'Platillo Crash 16"',                'A Series',      'Latón B20, ataque rápido.', 129990, 3, 'Baterías', 'Zildjian'),
    ('TC001', 'Teclado Digital 61 teclas',         'PSR-E373',      '61 teclas sensibles al tacto, 622 voces.', 249990, 4, 'Teclados y Pianos', 'Yamaha'),
    ('TC002', 'Piano Digital 88 teclas',           'P-45',          '88 teclas pesadas, 10 voces, pedal sustain incluido.', 499990, 2, 'Teclados y Pianos', 'Yamaha'),
    ('TC003', 'Sintetizador 49 teclas',            'MiniLab MKII',  'MIDI controller, 49 mini teclas.', 129990, 5, 'Teclados y Pianos', 'Arturia'),
    ('TC004', 'Teclado MIDI 88 teclas',            'Hammer 88',     '88 teclas martillo, sin sonidos propios.', 399990, 2, 'Teclados y Pianos', 'M-Audio'),
    ('AM001', 'Amplificador Guitarra 15W',         'Frontman 15G',  '15W, distorsión incorporada, entrada auxiliar.', 99990, 5, 'Amplificadores', 'Fender'),
    ('AM002', 'Amplificador Guitarra 40W',         'MG40GFX',       '40W, 4 canales, efectos digitales integrados.', 299990, 3, 'Amplificadores', 'Marshall'),
    ('AM003', 'Amplificador Bajo 100W',            'HD100',         '100W, tweeter integrado, ecualizador de 4 bandas.', 449990, 2, 'Amplificadores', 'Hartke'),
    ('AM004', 'Amplificador Acústico 40W',         'Loudbox Mini',  '60W, 2 canales, reverb y chorus incorporados.', 499990, 2, 'Amplificadores', 'Fishman'),
    ('MI001', 'Micrófono Dinámico Cardioide',      'SM58',          'Estándar industria para voz en vivo.', 149990, 8, 'Micrófonos', 'Shure'),
    ('MI002', 'Micrófono Dinámico Instrumento',    'SM57',          'Ideal para captura de instrumentos y amplificadores.', 139990, 6, 'Micrófonos', 'Shure'),
    ('MI003', 'Micrófono Condensador',             'AT2020',        'Cardioide, XLR, ideal para grabación en estudio.', 199990, 4, 'Micrófonos', 'Audio-Tech.'),
    ('MI004', 'Micrófono USB de Condensador',      'Yeti',          'USB, 4 patrones polares, ideal para streaming y podcast.', 299990, 5, 'Micrófonos', 'Blue'),
    ('PE001', 'Pedal Distorsión',                  'DS-1',          'Clásico pedal de distorsión, 3 controles.', 79990, 7, 'Pedales de Efectos', 'Boss'),
    ('PE002', 'Pedal Reverb',                      'RV-6',          '8 modos de reverb, control de shimmer.', 179990, 4, 'Pedales de Efectos', 'Boss'),
    ('PE003', 'Pedal Multi-efectos',               'ME-80',         'Diseño tipo pedalboard, 8 efectos simultáneos.', 349990, 2, 'Pedales de Efectos', 'Boss'),
    ('PE004', 'Pedal Tuner Cromático',             'TU-3',          'Afinador cromático, indicador de tono.', 89990, 8, 'Pedales de Efectos', 'Boss'),
    ('PE005', 'Pedal Delay',                       'Carbon Copy',   'Delay analógico cálido, tiempo 600ms.', 179990, 4, 'Pedales de Efectos', 'MXR'),
    ('PE006', 'Pedal Overdrive',                   'TS9',           'Tube Screamer clásico, sonido suave y orgánico.', 99990, 6, 'Pedales de Efectos', 'Ibanez'),
    ('AC001', 'Cuerdas Guitarra Eléctrica 09-42',  'Super Slinky',  'Juego 6 cuerdas, calibre ligero.', 8990, 25, 'Accesorios', 'Ernie Ball'),
    ('AC002', 'Cuerdas Guitarra Acústica 12-53',   'Earthwood',     'Bronce fósforo, sonido cálido.', 10990, 20, 'Accesorios', 'Ernie Ball'),
    ('AC003', 'Cuerdas Bajo 45-105',               'Regular Slinky','Cuerdas de níquel enrollado, set 4 cuerdas.', 14990, 12, 'Accesorios', 'Ernie Ball'),
    ('AC004', 'Púas de Guitarra x10 (0.73mm)',     '351',           'Celulosa, grosor medio.', 3990, 50, 'Accesorios', 'Fender'),
    ('AC005', 'Capotraste Guitarra',               'Trigger',       'Capotraste de resorte, compatible 6 cuerdas.', 12990, 15, 'Accesorios', 'Dunlop'),
    ('AC006', 'Afinador de Clip',                  'SN-5',          'Afinador cromático de clip, pantalla giratoria.', 8990, 20, 'Accesorios', 'Snark'),
    ('AC007', 'Cable Instrumento 3m',              'S100-I-3',      'Cable trenzado, conectores dorados, tres metros.', 12990, 15, 'Accesorios', 'Monster'),
    ('AC008', 'Cable Instrumento 6m',              'S100-I-6',      'Cable trenzado, conectores dorados, 6 metros.', 17990, 10, 'Accesorios', 'Monster'),
    ('AC009', 'Soporte Guitarra de Piso',          'GS302B',        'Soporte plegable con enganche automático.', 22990, 12, 'Accesorios', 'Hercules'),
    ('AC010', 'Soporte Guitarra de Pared',         'WAH-202',       'Montaje a pared, enganche automático.', 18990, 10, 'Accesorios', 'Hercules'),
    ('ES001', 'Interfaz de Audio 2x2 USB',         'Scarlett Solo', '1 entrada XLR+instrumento, 2 salidas, 24bit/192kHz.', 149990, 4, 'Estudio y Grabación', 'Focusrite'),
    ('ES002', 'Auriculares de Estudio',            'ATH-M20x',      'Circumaurales, respuesta 15Hz-20kHz.', 79990, 6, 'Estudio y Grabación', 'Audio-Tech.'),
    ('ES003', 'Auriculares de Estudio Pro',        'ATH-M50x',      'Referencia de industria, sonido neutro y detallado.', 219990, 4, 'Estudio y Grabación', 'Audio-Tech.'),
    ('ES004', 'Monitor de Estudio 5"',             'HS5',           'Altavoz activo, respuesta plana, ideal mezcla.', 349990, 2, 'Estudio y Grabación', 'Yamaha'),
    ('ES005', 'Pop Filter para Micrófono',         'MZP 40',        'Doble malla, brazo flexible con clip.', 14990, 8, 'Estudio y Grabación', 'Sennheiser')
)
INSERT INTO producto (sku, nombre, modelo, descripcion, precio, stock, id_categoria, id_marca)
SELECT p.sku, p.nombre, p.modelo, p.descripcion, p.precio, p.stock,
       c.id_categoria, m.id_marca
FROM producto_seed p
JOIN categoria c ON c.nombre = p.categoria
JOIN marca m ON m.nombre = p.marca
ORDER BY p.sku;
