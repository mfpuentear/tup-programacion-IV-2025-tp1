# API Gestión de Alumnos

API para gestionar alumnos con 3 notas. Calcula promedio y estado (reprobado/aprobado/promocionado) al consultar.

## Endpoints
- `POST /api/alumnos` - Crear alumno
- `GET /api/alumnos` - Listar todos
- `GET /api/alumnos/:id` - Obtener por ID
- `PUT /api/alumnos/:id` - Actualizar
- `DELETE /api/alumnos/:id` - Eliminar
- `GET /api/alumnos/nombre/:nombre` - Buscar por nombre

## Validaciones
- Nombre único
- 3 notas entre 0-10
- IDs válidos