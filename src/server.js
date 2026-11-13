import 'dotenv/config';
import app from './app.js';

const puerto = Number(process.env.PORT) || 3000;

app.listen(puerto, () => {
  console.log(`API Sonido Vivo escuchando en http://localhost:${puerto}`);
  console.log(`Documentación Swagger UI: http://localhost:${puerto}/api/docs`);
});
