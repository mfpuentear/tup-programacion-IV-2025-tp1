import express from 'express'

// Inicializar la aplicación
const app = express()
const port = 3000
app.use(express.json())

let calculos = []

// ---------------- Ruta principal
app.get('/', (req, res) => {
    // Responde con string
    res.send('Hola Mundo!')
})

// <----------------> OBTENER CÁLCULOS <---------------->
app.get('/calculos', (req, res) => {
    // Respuesta final
    res.json({ success: true, data: calculos })
})

// <----------------> CREAR CÁLCULO <---------------->
app.post('/calculos', (req, res) => {
    // Crear un nuevo cálculo
    const { base, altura } = req.body

    // Validar que todos los campos estén presentes
    if (base === undefined || altura === undefined) {
        return res.status(400).json({ success: false, message: 'Todos los campos (base, altura) son obligatorios' })
    }

    // Buscar el ID máximo actual y sumar 1
    const maxId = calculos.length > 0 ? Math.max(...calculos.map(c => c.id)) : 0
    const nuevoCalculo = {
        id: maxId + 1,
        base,
        altura,
        area: base * altura,
        perimetro: 2 * (base + altura)
    }

    // Agregar el nuevo cálculo al arreglo
    calculos.push(nuevoCalculo)

    console.log('Nuevo cálculo creado:', nuevoCalculo)

    // Responder con el nuevo cálculo
    res.send({ success: true, data: nuevoCalculo })
})

// <----------------> OBTENER PRODUCTO POR ID <---------------->
app.get('/calculos/:id', (req, res) => {
    // Obtener el ID del producto
    const id = Number(req.params.id)

    // Validar id
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Buscar el cálculo por ID
    const calculo = calculos.find(c => c.id === id)
    if (!calculo) {
        // Si no se encuentra el cálculo, se devuelve un error 404
        return res.status(404).json({ success: false, message: 'Cálculo no encontrado' })
    }

    // Si se encuentra el cálculo, se devuelve en la respuesta
    res.json({ success: true, data: calculo })
})

// <----------------> ELIMINAR CÁLCULO <---------------->
app.delete('/calculos/:id', (req, res) => {
    // Obtener el ID del cálculo
    const id = Number(req.params.id)

    // Validar id
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Buscar el cálculo por ID
    const calculoEncontrado = calculos.find(p => p.id === id)
    if (!calculoEncontrado) {
        // Si no se encuentra el cálculo, se devuelve un error 404
        return res.status(404).json({ success: false, message: 'Cálculo no encontrado' })
    }

    // Eliminar el cálculo
    calculos = calculos.filter(c => c.id !== id)
    console.log('Cálculo eliminado:', calculoEncontrado)

    // Responder con el cálculo eliminado
    res.json({ success: true, data: calculoEncontrado })
})

// Iniciar el servidor
app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`)
})