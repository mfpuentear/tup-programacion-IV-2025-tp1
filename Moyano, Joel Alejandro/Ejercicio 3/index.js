import express from 'express'

// Inicializar la aplicación
const app = express()
const port = 3000
app.use(express.json())

let tareas = []

// ---------------- Ruta principal
app.get('/', (req, res) => {
    // Responde con string
    res.send('Hola Mundo!')
})

// <----------------> OBTENER TAREAS <---------------->
app.get('/tareas', (req, res) => {
    // Obtener el parámetro de consulta 'completada'
    const { completada } = req.query;

    // Filtrar las tareas
    let tareasFiltradas = tareas;

    // Validar si existen tareas
    if (tareas.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay tareas disponibles' });
    }

    // Filtrar por tarea completada o no completada
    if (completada !== undefined) {
        const fueCompletada = completada === 'true';
        tareasFiltradas = tareas.filter(t => t.completada === fueCompletada);
    }

    // Respuesta final
    res.json({ success: true, data: tareasFiltradas })
})

// <----------------> CREAR TAREA <---------------->
app.post('/tareas', (req, res) => {
    // Crear una nueva tarea
    const { tarea, completada } = req.body

    // Validar que todos los campos estén presentes
    if (tarea === undefined || completada === undefined) {
        return res.status(400).json({ success: false, message: 'Todos los campos (tarea, completada) son obligatorios' })
    }

    // Validar que los nombres no se repitan
    if (tareas.some(t => t.tarea === tarea)) {
        return res.status(400).json({ success: false, message: 'La tarea ya existe' })
    }

    // Buscar el ID máximo actual y sumar 1
    const maxId = tareas.length > 0 ? Math.max(...tareas.map(t => t.id)) : 0

    // Crear la nueva tarea
    const nuevaTarea = {
        id: maxId + 1,
        tarea,
        completada
    }

    // Agregar la nueva tarea al arreglo
    tareas.push(nuevaTarea)

    console.log('Nueva tarea creada:', { id: nuevaTarea.id, tarea: nuevaTarea.tarea, completada: nuevaTarea.completada })

    // Responder con la nueva tarea
    res.send({ success: true, data: { id: nuevaTarea.id, tarea: nuevaTarea.tarea, completada: nuevaTarea.completada } })
})

// <----------------> OBTENER TAREA POR ID <---------------->
app.get('/tareas/:id', (req, res) => {
    // Obtener el ID de la tarea
    const id = Number(req.params.id)

    // Validar id
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Buscar la tarea por ID
    const tarea = tareas.find(t => t.id === id)
    if (!tarea) {
        // Si no se encuentra la tarea, se devuelve un error 404
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' })
    }

    // Si se encuentra la tarea, se devuelve en la respuesta
    res.json({ success: true, data: { id: tarea.id, tarea: tarea.tarea, completada: tarea.completada } })
})

// <----------------> ELIMINAR TAREA <---------------->
app.delete('/tareas/:id', (req, res) => {
    // Obtener el ID de la tarea
    const id = Number(req.params.id)

    // Validar id
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Buscar la tarea por ID
    const tareaEncontrada = tareas.find(t => t.id === id)
    if (!tareaEncontrada) {
        // Si no se encuentra la tarea, se devuelve un error 404
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' })
    }

    // Eliminar la tarea
    tareas = tareas.filter(t => t.id !== id)
    console.log('Tarea eliminada:', tareaEncontrada)

    // Responder con la tarea eliminada
    res.json({ success: true, data: tareaEncontrada })
})

// Iniciar el servidor
app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`)
})