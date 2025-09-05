# API Gestión de Tareas

API para gestionar tareas completadas y pendientes con validación de nombres únicos.

## Endpoints
- `POST /api/tareas` - Crear tarea
- `GET /api/tareas` - Listar todas
- `GET /api/tareas/:id` - Obtener por ID
- `PUT /api/tareas/:id` - Actualizar
- `DELETE /api/tareas/:id` - Eliminar
- `GET /api/tareas/estado/:estado` - Filtrar por estado
- `PATCH /api/tareas/:id/completar` - Marcar como completada
- `PATCH /api/tareas/:id/pendiente` - Marcar como pendiente

## Validaciones
- Nombre único
- Estado boolean (true/false)
- IDs válidos