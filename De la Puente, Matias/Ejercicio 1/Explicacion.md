API con Express.js para calcular perímetros y áreas de rectángulos/cuadrados. Los cálculos se guardan en memoria y al consultar se identifica el tipo de figura.

Endpoints
POST /api/rectangulos - Crear cálculo

GET /api/rectangulos - Listar todos

GET /api/rectangulos/:id - Obtener por ID

DELETE /api/rectangulos/:id - Eliminar

GET /api/rectangulos/tipo/:tipo - Filtrar (cuadrado/rectangulo)

Ejecución
npm install
npm start


Ejemplo de uso
http
POST http://localhost:3000/api/rectangulos
Content-Type: application/json
{
  "base": 5,
  "altura": 3
}

Validaciones
Base y altura deben ser números > 0

IDs deben ser números válidos

Tipos de filtro: "cuadrado" o "rectangulo"