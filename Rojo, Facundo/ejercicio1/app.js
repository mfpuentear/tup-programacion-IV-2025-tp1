const express = require('express');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Arreglo interno para guardar los cálculos
let calculos = [];
let nextId = 1;

// Función auxiliar para determinar si es cuadrado o rectángulo
const getTipo = (ancho, alto) => {
    return ancho === alto ? 'cuadrado' : 'rectángulo';
};

// Función auxiliar para calcular perímetro
const calcularPerimetro = (ancho, alto) => {
    return 2 * (ancho + alto);
};

// Función auxiliar para calcular superficie
const calcularSuperficie = (ancho, alto) => {
    return ancho * alto;
};

// Función de validación
const validarDimensiones = (ancho, alto) => {
    if (typeof ancho !== 'number' || typeof alto !== 'number') {
        return 'Las dimensiones deben ser números';
    }
    if (ancho <= 0 || alto <= 0) {
        return 'Las dimensiones deben ser mayores a 0';
    }
    return null;
};

// POST /rectangulos - Crear nuevo cálculo
app.post('/rectangulos', (req, res) => {
    const { ancho, alto } = req.body;
    
    // Validaciones
    if (!ancho || !alto) {
        return res.status(400).json({
            error: 'Se requieren las dimensiones ancho y alto'
        });
    }
    
    const errorValidacion = validarDimensiones(ancho, alto);
    if (errorValidacion) {
        return res.status(400).json({
            error: errorValidacion
        });
    }
    
    // Crear el cálculo
    const nuevoCalculo = {
        id: nextId++,
        ancho: ancho,
        alto: alto,
        perimetro: calcularPerimetro(ancho, alto),
        superficie: calcularSuperficie(ancho, alto)
    };
    
    calculos.push(nuevoCalculo);
    
    // Respuesta incluyendo el tipo (sin guardarlo)
    res.status(201).json({
        ...nuevoCalculo,
        tipo: getTipo(ancho, alto)
    });
});

// GET /rectangulos - Obtener todos los cálculos
app.get('/rectangulos', (req, res) => {
    const calculosConTipo = calculos.map(calculo => ({
        ...calculo,
        tipo: getTipo(calculo.ancho, calculo.alto)
    }));
    
    res.json({
        total: calculos.length,
        calculos: calculosConTipo
    });
});

// GET /rectangulos/:id - Obtener un cálculo específico
app.get('/rectangulos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const calculo = calculos.find(c => c.id === id);
    
    if (!calculo) {
        return res.status(404).json({
            error: 'Cálculo no encontrado'
        });
    }
    
    res.json({
        ...calculo,
        tipo: getTipo(calculo.ancho, calculo.alto)
    });
});

// DELETE /rectangulos/:id - Eliminar un cálculo
app.delete('/rectangulos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número válido'
        });
    }
    
    const index = calculos.findIndex(c => c.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            error: 'Cálculo no encontrado'
        });
    }
    
    const calculoEliminado = calculos.splice(index, 1)[0];
    
    res.json({
        message: 'Cálculo eliminado correctamente',
        calculo: {
            ...calculoEliminado,
            tipo: getTipo(calculoEliminado.ancho, calculoEliminado.alto)
        }
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