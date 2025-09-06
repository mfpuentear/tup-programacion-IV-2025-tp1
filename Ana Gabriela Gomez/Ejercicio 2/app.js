const express = require('express');
const app = express();
app.use(express.json());

// Arreglo para almacenar alumnos
let alumnos = [];
let nextId = 1;

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de Gestión de Alumnos',
        endpoints: {
            'POST /api/alumnos': 'Crear nuevo alumno',
            'GET /api/alumnos': 'Obtener todos los alumnos',
            'GET /api/alumnos/:id': 'Obtener alumno específico',
            'PUT /api/alumnos/:id': 'Actualizar alumno',
            'DELETE /api/alumnos/:id': 'Eliminar alumno',
            'GET /api/alumnos/nombre/:nombre': 'Buscar alumno por nombre'
        }
    });
});

// Validaciones
const validarNotas = (notas) => {
    if (!Array.isArray(notas) || notas.length !== 3) {
        return 'Debe tener exactamente 3 notas';
    }
    
    for (let i = 0; i < notas.length; i++) {
        if (isNaN(parseFloat(notas[i]))) {
            return `Nota ${i+1} debe ser un número`;
        }
        const nota = parseFloat(notas[i]);
        if (nota < 0 || nota > 10) {
            return `Nota ${i+1} debe estar entre 0 y 10`;
        }
    }
    return null;
};

const validarNombreUnico = (nombre, excludeId = null) => {
    const alumnoExistente = alumnos.find(a => 
        a.nombre.toLowerCase() === nombre.toLowerCase() && a.id !== excludeId
    );
    return alumnoExistente ? 'Ya existe un alumno con ese nombre' : null;
};

// POST /api/alumnos - Crear nuevo alumno
app.post('/api/alumnos', (req, res) => {
    try {
        const { nombre, notas } = req.body;

        // Validaciones
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ error: 'Nombre es requerido y debe ser texto' });
        }

        const errorNotas = validarNotas(notas);
        if (errorNotas) {
            return res.status(400).json({ error: errorNotas });
        }

        const errorNombre = validarNombreUnico(nombre);
        if (errorNombre) {
            return res.status(400).json({ error: errorNombre });
        }

        // Crear alumno
        const alumno = {
            id: nextId++,
            nombre: nombre.trim(),
            notas: notas.map(nota => parseFloat(nota)),
            fechaCreacion: new Date().toISOString()
        };

        alumnos.push(alumno);

        res.status(201).json(alumno);

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/alumnos - Obtener todos los alumnos
app.get('/api/alumnos', (req, res) => {
    try {
        const alumnosConEstado = alumnos.map(alumno => {
            const promedio = alumno.notas.reduce((sum, nota) => sum + nota, 0) / 3;
            let estado = 'reprobado';
            
            if (promedio >= 8) estado = 'promocionado';
            else if (promedio >= 6) estado = 'aprobado';

            return {
                ...alumno,
                promedio: parseFloat(promedio.toFixed(2)),
                estado
            };
        });

        res.json({
            total: alumnosConEstado.length,
            alumnos: alumnosConEstado
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/alumnos/:id - Obtener alumno específico
app.get('/api/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const alumno = alumnos.find(a => a.id === id);
        
        if (!alumno) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const promedio = alumno.notas.reduce((sum, nota) => sum + nota, 0) / 3;
        let estado = 'reprobado';
        if (promedio >= 8) estado = 'promocionado';
        else if (promedio >= 6) estado = 'aprobado';

        res.json({
            ...alumno,
            promedio: parseFloat(promedio.toFixed(2)),
            estado
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /api/alumnos/:id - Actualizar alumno
app.put('/api/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, notas } = req.body;

        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const alumnoIndex = alumnos.findIndex(a => a.id === id);
        if (alumnoIndex === -1) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        // Validaciones
        if (nombre && typeof nombre !== 'string') {
            return res.status(400).json({ error: 'Nombre debe ser texto' });
        }

        if (notas) {
            const errorNotas = validarNotas(notas);
            if (errorNotas) {
                return res.status(400).json({ error: errorNotas });
            }
        }

        if (nombre) {
            const errorNombre = validarNombreUnico(nombre, id);
            if (errorNombre) {
                return res.status(400).json({ error: errorNombre });
            }
        }

        // Actualizar alumno
        const alumnoActualizado = {
            ...alumnos[alumnoIndex],
            ...(nombre && { nombre: nombre.trim() }),
            ...(notas && { notas: notas.map(nota => parseFloat(nota)) }),
            fechaActualizacion: new Date().toISOString()
        };

        alumnos[alumnoIndex] = alumnoActualizado;

        res.json(alumnoActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/alumnos/:id - Eliminar alumno
app.delete('/api/alumnos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const alumnoIndex = alumnos.findIndex(a => a.id === id);
        if (alumnoIndex === -1) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        const alumnoEliminado = alumnos.splice(alumnoIndex, 1)[0];
        res.json({ message: 'Alumno eliminado correctamente', alumno: alumnoEliminado });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/alumnos/nombre/:nombre - Buscar por nombre
app.get('/api/alumnos/nombre/:nombre', (req, res) => {
    try {
        const { nombre } = req.params;
        
        if (!nombre || typeof nombre !== 'string') {
            return res.status(400).json({ error: 'Nombre de búsqueda requerido' });
        }

        const alumnosEncontrados = alumnos.filter(a => 
            a.nombre.toLowerCase().includes(nombre.toLowerCase())
        );

        const alumnosConEstado = alumnosEncontrados.map(alumno => {
            const promedio = alumno.notas.reduce((sum, nota) => sum + nota, 0) / 3;
            let estado = 'reprobado';
            if (promedio >= 8) estado = 'promocionado';
            else if (promedio >= 6) estado = 'aprobado';

            return {
                ...alumno,
                promedio: parseFloat(promedio.toFixed(2)),
                estado
            };
        });

        res.json({
            busqueda: nombre,
            total: alumnosConEstado.length,
            alumnos: alumnosConEstado
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor de alumnos ejecutándose en http://localhost:${PORT}`);
});