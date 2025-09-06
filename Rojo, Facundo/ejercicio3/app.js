const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Arreglo interno para guardar las tareas
let tareas = [];
let nextId = 1;

// Función para verificar nombre único
const existeNombre = (nombre, idExcluir = null) => {
    return tareas.some(tarea => 
        tarea.nombre.toLowerCase() === nombre.toLowerCase() && 
        tarea.id !== idExcluir
    );
};

// Función de validación
const validarTarea = (nombre, completada = false) => {
    // Validar nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return 'Se requiere un nombre válido para la tarea';
    }
    
    // Validar estado completada (debe ser boolean)
    if (completada !== undefined && typeof completada !== 'boolean') {
        return 'El estado completada debe ser true o false';
    }
    
    return null;
};

// POST /tareas - Crear nueva tarea
app.post('/tareas', (req, res) => {
    const { nombre, completada = false } = req.body;
    
    // Validaciones básicas
    const errorValidacion = validarTarea(nombre, completada);
    if (errorValidacion) {
        return res.status(400).json({
            error: errorValidacion
        });
    }
    
    const nombreLimpio = nombre.trim();
    
    // Verificar nombre único
    if (existeNombre(nombreLimpio)) {
        return res.status(400).json({
            error: 'Ya existe una tarea con ese nombre'
        });
    }
    
    // Crear la tarea
    const nuevaTarea = {
        id: nextId++,
        nombre: nombreLimpio,
        completada: completada
    };
    
    tareas.push(nuevaTarea);
    
    res.status(201).json(nuevaTarea);
});

// GET /tareas - Obtener todas las tareas (con filtros opcionales)
app.get('/tareas', (req, res) => {
    const { completada } = req.query;
    
    let tareasFiltradas = tareas;
    
    // Aplicar filtro si se proporciona
    if (completada !== undefined) {
        // Convertir string a boolean
        const estadoFiltro = completada === 'true';
        tareasFiltradas = tareas.filter(tarea => tarea.completada === estadoFiltro);
    }
    
    res.json({
        total: tareasFiltradas.length,
        filtro: completada !== undefined ? `completada=${completada}` : 'sin filtro',
        tareas: tareasFiltradas
    });
});

// GET /tareas/:id - Obtener una tarea específica
app.get('/tareas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const tarea = tareas.find(t => t.id === id);
    
    if (!tarea) {
        return res.status(404).json({
            error: 'Tarea no encontrada'
        });
    }
    
    res.json(tarea);
});

// PUT /tareas/:id - Modificar una tarea
app.put('/tareas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const tarea = tareas.find(t => t.id === id);
    
    if (!tarea) {
        return res.status(404).json({
            error: 'Tarea no encontrada'
        });
    }
    
    const { nombre, completada } = req.body;
    
    // Validar nombre si se proporciona
    if (nombre !== undefined) {
        const errorValidacion = validarTarea(nombre);
        if (errorValidacion) {
            return res.status(400).json({
                error: errorValidacion
            });
        }
        
        const nombreLimpio = nombre.trim();
        
        // Verificar nombre único (excluyendo la tarea actual)
        if (existeNombre(nombreLimpio, id)) {
            return res.status(400).json({
                error: 'Ya existe otra tarea con ese nombre'
            });
        }
        
        tarea.nombre = nombreLimpio;
    }
    
    // Validar estado completada si se proporciona
    if (completada !== undefined) {
        if (typeof completada !== 'boolean') {
            return res.status(400).json({
                error: 'El estado completada debe ser true o false'
            });
        }
        
        tarea.completada = completada;
    }
    
    res.json(tarea);
});

// DELETE /tareas/:id - Eliminar una tarea
app.delete('/tareas/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const index = tareas.findIndex(t => t.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            error: 'Tarea no encontrada'
        });
    }
    
    const tareaEliminada = tareas.splice(index, 1)[0];
    
    res.json({
        message: 'Tarea eliminada correctamente',
        tarea: tareaEliminada
    });
});

// Endpoint adicional: Marcar tarea como completada
app.patch('/tareas/:id/completar', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const tarea = tareas.find(t => t.id === id);
    
    if (!tarea) {
        return res.status(404).json({
            error: 'Tarea no encontrada'
        });
    }
    
    tarea.completada = true;
    
    res.json({
        message: 'Tarea marcada como completada',
        tarea: tarea
    });
});

// Endpoint adicional: Marcar tarea como pendiente
app.patch('/tareas/:id/pendiente', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const tarea = tareas.find(t => t.id === id);
    
    if (!tarea) {
        return res.status(404).json({
            error: 'Tarea no encontrada'
        });
    }
    
    tarea.completada = false;
    
    res.json({
        message: 'Tarea marcada como pendiente',
        tarea: tarea
    });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});