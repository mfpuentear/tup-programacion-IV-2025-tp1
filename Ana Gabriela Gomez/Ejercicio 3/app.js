const express = require('express');
const app = express();
app.use(express.json());

// Arreglo para almacenar tareas
let tareas = [];
let nextId = 1;

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de Gestión de Tareas',
        endpoints: {
            'POST /api/tareas': 'Crear nueva tarea',
            'GET /api/tareas': 'Obtener todas las tareas',
            'GET /api/tareas/:id': 'Obtener tarea específica',
            'PUT /api/tareas/:id': 'Actualizar tarea',
            'DELETE /api/tareas/:id': 'Eliminar tarea',
            'GET /api/tareas/estado/:estado': 'Filtrar por estado (completada/pendiente)'
        }
    });
});

// Validaciones
const validarNombreUnico = (nombre, excludeId = null) => {
    const tareaExistente = tareas.find(t => 
        t.nombre.toLowerCase() === nombre.toLowerCase() && t.id !== excludeId
    );
    return tareaExistente ? 'Ya existe una tarea con ese nombre' : null;
};

const validarEstado = (completada) => {
    if (completada !== undefined && typeof completada !== 'boolean') {
        return 'Completada debe ser true o false';
    }
    return null;
};

// POST /api/tareas - Crear nueva tarea
app.post('/api/tareas', (req, res) => {
    try {
        const { nombre, completada } = req.body;

        // Validaciones
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ error: 'Nombre es requerido y debe ser texto' });
        }

        const errorNombre = validarNombreUnico(nombre);
        if (errorNombre) {
            return res.status(400).json({ error: errorNombre });
        }

        const errorEstado = validarEstado(completada);
        if (errorEstado) {
            return res.status(400).json({ error: errorEstado });
        }

        // Crear tarea
        const tarea = {
            id: nextId++,
            nombre: nombre.trim(),
            completada: completada || false,
            fechaCreacion: new Date().toISOString()
        };

        tareas.push(tarea);

        res.status(201).json(tarea);

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/tareas - Obtener todas las tareas
app.get('/api/tareas', (req, res) => {
    try {
        res.json({
            total: tareas.length,
            completadas: tareas.filter(t => t.completada).length,
            pendientes: tareas.filter(t => !t.completada).length,
            tareas: tareas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/tareas/:id - Obtener tarea específica
app.get('/api/tareas/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const tarea = tareas.find(t => t.id === id);
        
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json(tarea);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /api/tareas/:id - Actualizar tarea
app.put('/api/tareas/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, completada } = req.body;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const tareaIndex = tareas.findIndex(t => t.id === id);
        if (tareaIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Validaciones
        if (nombre && typeof nombre !== 'string') {
            return res.status(400).json({ error: 'Nombre debe ser texto' });
        }

        const errorEstado = validarEstado(completada);
        if (errorEstado) {
            return res.status(400).json({ error: errorEstado });
        }

        if (nombre) {
            const errorNombre = validarNombreUnico(nombre, id);
            if (errorNombre) {
                return res.status(400).json({ error: errorNombre });
            }
        }

        // Actualizar tarea
        const tareaActualizada = {
            ...tareas[tareaIndex],
            ...(nombre && { nombre: nombre.trim() }),
            ...(completada !== undefined && { completada }),
            fechaActualizacion: new Date().toISOString()
        };

        tareas[tareaIndex] = tareaActualizada;

        res.json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/tareas/:id - Eliminar tarea
app.delete('/api/tareas/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const tareaIndex = tareas.findIndex(t => t.id === id);
        if (tareaIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        const tareaEliminada = tareas.splice(tareaIndex, 1)[0];
        res.json({ message: 'Tarea eliminada correctamente', tarea: tareaEliminada });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/tareas/estado/:estado - Filtrar por estado
app.get('/api/tareas/estado/:estado', (req, res) => {
    try {
        const { estado } = req.params;
        
        if (estado !== 'completada' && estado !== 'pendiente') {
            return res.status(400).json({ 
                error: 'Estado debe ser "completada" o "pendiente"' 
            });
        }

        const esCompletada = estado === 'completada';
        const tareasFiltradas = tareas.filter(t => t.completada === esCompletada);

        res.json({
            estado,
            total: tareasFiltradas.length,
            tareas: tareasFiltradas
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PATCH /api/tareas/:id/completar - Marcar como completada
app.patch('/api/tareas/:id/completar', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const tareaIndex = tareas.findIndex(t => t.id === id);
        if (tareaIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        tareas[tareaIndex].completada = true;
        tareas[tareaIndex].fechaActualizacion = new Date().toISOString();

        res.json(tareas[tareaIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PATCH /api/tareas/:id/pendiente - Marcar como pendiente
app.patch('/api/tareas/:id/pendiente', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const tareaIndex = tareas.findIndex(t => t.id === id);
        if (tareaIndex === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        tareas[tareaIndex].completada = false;
        tareas[tareaIndex].fechaActualizacion = new Date().toISOString();

        res.json(tareas[tareaIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Servidor de tareas ejecutándose en http://localhost:${PORT}`);
});