const express = require('express');
const app = express();
app.use(express.json());

// Arreglo para almacenar los cálculos
let calculos = [];
let nextId = 1;

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de Cálculos de Rectángulos y Cuadrados',
        endpoints: {
            'POST /api/rectangulos': 'Crear nuevo cálculo',
            'GET /api/rectangulos': 'Obtener todos los cálculos',
            'GET /api/rectangulos/:id': 'Obtener cálculo específico',
            'DELETE /api/rectangulos/:id': 'Eliminar cálculo',
            'GET /api/rectangulos/tipo/:tipo': 'Filtrar por tipo (cuadrado/rectangulo)'
        },
        instructions: 'Usa los endpoints de arriba para interactuar con la API'
    });
});

// Validar números positivos
const validarNumeroPositivo = (valor, nombre) => {
    if (valor === undefined || valor === null) {
        return `${nombre} es requerido`;
    }
    if (isNaN(parseFloat(valor))) {
        return `${nombre} debe ser un número válido`;
    }
    if (parseFloat(valor) <= 0) {
        return `${nombre} debe ser mayor a 0`;
    }
    return null;
};

// POST /api/rectangulos - Calcular perímetro y superficie
app.post('/api/rectangulos', (req, res) => {
    try {
        const { base, altura } = req.body;

        // Validaciones
        const errorBase = validarNumeroPositivo(base, 'Base');
        const errorAltura = validarNumeroPositivo(altura, 'Altura');
        
        if (errorBase || errorAltura) {
            return res.status(400).json({
                error: 'Datos inválidos',
                detalles: {
                    base: errorBase,
                    altura: errorAltura
                }
            });
        }

        const baseNum = parseFloat(base);
        const alturaNum = parseFloat(altura);

        // Cálculos
        const perimetro = 2 * (baseNum + alturaNum);
        const superficie = baseNum * alturaNum;
        const esCuadrado = baseNum === alturaNum;

        // Guardar cálculo (sin el campo esCuadrado)
        const calculo = {
            id: nextId++,
            base: baseNum,
            altura: alturaNum,
            perimetro,
            superficie,
            fecha: new Date().toISOString()
        };

        calculos.push(calculo);

        // Respuesta con el tipo de figura
        res.status(201).json({
            ...calculo,
            tipo: esCuadrado ? 'cuadrado' : 'rectángulo'
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/rectangulos - Obtener todos los cálculos
app.get('/api/rectangulos', (req, res) => {
    try {
        // Agregar el tipo de figura en la respuesta (no se guarda en el arreglo)
        const calculosConTipo = calculos.map(calculo => ({
            ...calculo,
            tipo: calculo.base === calculo.altura ? 'cuadrado' : 'rectángulo'
        }));

        res.json({
            total: calculosConTipo.length,
            calculos: calculosConTipo
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/rectangulos/:id - Obtener cálculo específico
app.get('/api/rectangulos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const calculo = calculos.find(c => c.id === id);
        
        if (!calculo) {
            return res.status(404).json({ error: 'Cálculo no encontrado' });
        }

        // Agregar el tipo de figura en la respuesta
        res.json({
            ...calculo,
            tipo: calculo.base === calculo.altura ? 'cuadrado' : 'rectángulo'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/rectangulos/:id - Eliminar cálculo
app.delete('/api/rectangulos/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'ID debe ser un número positivo' });
        }

        const index = calculos.findIndex(c => c.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Cálculo no encontrado' });
        }

        const calculoEliminado = calculos.splice(index, 1)[0];
        
        res.json({
            mensaje: 'Cálculo eliminado correctamente',
            calculo: {
                ...calculoEliminado,
                tipo: calculoEliminado.base === calculoEliminado.altura ? 'cuadrado' : 'rectángulo'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/rectangulos/tipo/:tipo - Filtrar por tipo
app.get('/api/rectangulos/tipo/:tipo', (req, res) => {
    try {
        const { tipo } = req.params;
        
        if (tipo !== 'cuadrado' && tipo !== 'rectangulo') {
            return res.status(400).json({ 
                error: 'Tipo debe ser "cuadrado" o "rectangulo"' 
            });
        }

        const calculosFiltrados = calculos.filter(calculo => {
            const esCuadrado = calculo.base === calculo.altura;
            return (tipo === 'cuadrado' && esCuadrado) || 
                   (tipo === 'rectangulo' && !esCuadrado);
        });

        res.json({
            tipo,
            total: calculosFiltrados.length,
            calculos: calculosFiltrados.map(calculo => ({
                ...calculo,
                tipo: tipo
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});