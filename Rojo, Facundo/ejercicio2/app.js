const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Arreglo interno para guardar los alumnos
let alumnos = [];
let nextId = 1;

// Función auxiliar para calcular promedio
const calcularPromedio = (nota1, nota2, nota3) => {
    return (nota1 + nota2 + nota3) / 3;
};

// Función auxiliar para determinar estado académico
const getEstadoAcademico = (promedio) => {
    if (promedio < 6) return 'reprobado';
    if (promedio >= 6 && promedio < 8) return 'aprobado';
    return 'promocionado';
};

// Función de validación de notas
const validarNotas = (nota1, nota2, nota3) => {
    const notas = [nota1, nota2, nota3];
    
    // Verificar que todas las notas existan
    if (notas.some(nota => nota === undefined || nota === null)) {
        return 'Se requieren las tres notas';
    }
    
    // Verificar que sean números
    if (notas.some(nota => typeof nota !== 'number')) {
        return 'Todas las notas deben ser números';
    }
    
    // Verificar rango válido (0-10)
    if (notas.some(nota => nota < 0 || nota > 10)) {
        return 'Las notas deben estar entre 0 y 10';
    }
    
    return null;
};

// Función para verificar nombre único
const existeNombre = (nombre, idExcluir = null) => {
    return alumnos.some(alumno => 
        alumno.nombre.toLowerCase() === nombre.toLowerCase() && 
        alumno.id !== idExcluir
    );
};

// POST /alumnos - Crear nuevo alumno
app.post('/alumnos', (req, res) => {
    const { nombre, nota1, nota2, nota3 } = req.body;
    
    // Validar nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({
            error: 'Se requiere un nombre válido'
        });
    }
    
    const nombreLimpio = nombre.trim();
    
    // Verificar nombre único
    if (existeNombre(nombreLimpio)) {
        return res.status(400).json({
            error: 'Ya existe un alumno con ese nombre'
        });
    }
    
    // Validar notas
    const errorNotas = validarNotas(nota1, nota2, nota3);
    if (errorNotas) {
        return res.status(400).json({
            error: errorNotas
        });
    }
    
    // Crear el alumno
    const nuevoAlumno = {
        id: nextId++,
        nombre: nombreLimpio,
        nota1: nota1,
        nota2: nota2,
        nota3: nota3
    };
    
    alumnos.push(nuevoAlumno);
    
    // Respuesta con datos calculados
    const promedio = calcularPromedio(nota1, nota2, nota3);
    const estadoAcademico = getEstadoAcademico(promedio);
    
    res.status(201).json({
        ...nuevoAlumno,
        promedio: Math.round(promedio * 100) / 100, // 2 decimales
        estadoAcademico: estadoAcademico
    });
});

// GET /alumnos - Obtener todos los alumnos
app.get('/alumnos', (req, res) => {
    const alumnosConEstado = alumnos.map(alumno => {
        const promedio = calcularPromedio(alumno.nota1, alumno.nota2, alumno.nota3);
        const estadoAcademico = getEstadoAcademico(promedio);
        
        return {
            ...alumno,
            promedio: Math.round(promedio * 100) / 100,
            estadoAcademico: estadoAcademico
        };
    });
    
    res.json({
        total: alumnos.length,
        alumnos: alumnosConEstado
    });
});

// GET /alumnos/:id - Obtener un alumno específico
app.get('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const alumno = alumnos.find(a => a.id === id);
    
    if (!alumno) {
        return res.status(404).json({
            error: 'Alumno no encontrado'
        });
    }
    
    const promedio = calcularPromedio(alumno.nota1, alumno.nota2, alumno.nota3);
    const estadoAcademico = getEstadoAcademico(promedio);
    
    res.json({
        ...alumno,
        promedio: Math.round(promedio * 100) / 100,
        estadoAcademico: estadoAcademico
    });
});

// PUT /alumnos/:id - Modificar un alumno
app.put('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const alumno = alumnos.find(a => a.id === id);
    
    if (!alumno) {
        return res.status(404).json({
            error: 'Alumno no encontrado'
        });
    }
    
    const { nombre, nota1, nota2, nota3 } = req.body;
    
    // Validar nombre si se proporciona
    if (nombre !== undefined) {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            return res.status(400).json({
                error: 'El nombre debe ser una cadena válida'
            });
        }
        
        const nombreLimpio = nombre.trim();
        
        // Verificar nombre único (excluyendo el alumno actual)
        if (existeNombre(nombreLimpio, id)) {
            return res.status(400).json({
                error: 'Ya existe otro alumno con ese nombre'
            });
        }
        
        alumno.nombre = nombreLimpio;
    }
    
    // Validar notas si se proporcionan
    const nuevaNota1 = nota1 !== undefined ? nota1 : alumno.nota1;
    const nuevaNota2 = nota2 !== undefined ? nota2 : alumno.nota2;
    const nuevaNota3 = nota3 !== undefined ? nota3 : alumno.nota3;
    
    const errorNotas = validarNotas(nuevaNota1, nuevaNota2, nuevaNota3);
    if (errorNotas) {
        return res.status(400).json({
            error: errorNotas
        });
    }
    
    // Actualizar notas
    alumno.nota1 = nuevaNota1;
    alumno.nota2 = nuevaNota2;
    alumno.nota3 = nuevaNota3;
    
    // Respuesta con datos calculados
    const promedio = calcularPromedio(alumno.nota1, alumno.nota2, alumno.nota3);
    const estadoAcademico = getEstadoAcademico(promedio);
    
    res.json({
        ...alumno,
        promedio: Math.round(promedio * 100) / 100,
        estadoAcademico: estadoAcademico
    });
});

// DELETE /alumnos/:id - Eliminar un alumno
app.delete('/alumnos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const index = alumnos.findIndex(a => a.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            error: 'Alumno no encontrado'
        });
    }
    
    const alumnoEliminado = alumnos.splice(index, 1)[0];
    
    res.json({
        message: 'Alumno eliminado correctamente',
        alumno: alumnoEliminado
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