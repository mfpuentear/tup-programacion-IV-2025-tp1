import express from 'express'

const servidor = express()
const PUERTO = 3000
servidor.use(express.json())

let listaTareas = []

servidor.get('/', (req, res) => {
    res.send('Hola Mundo!')
})

servidor.get('/tareas', (req, res) => {
    const { completada } = req.query
    let resultado = listaTareas
    if (listaTareas.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay tareas disponibles' })
    }
    if (completada !== undefined) {
        const valor = completada === 'true'
        resultado = listaTareas.filter(t => t.completada === valor)
    }

    res.json({ success: true, data: resultado })
})

servidor.post('/tareas', (req, res) => {
    const { tarea, completada } = req.body
    if (tarea === undefined || completada === undefined) {
        return res.status(400).json({ success: false, message: 'Todos los campos (tarea, completada) son obligatorios' })
    }
    if (listaTareas.some(t => t.tarea === tarea)) {
        return res.status(400).json({ success: false, message: 'La tarea ya existe' })
    }

    const ultimoId = listaTareas.length > 0 ? Math.max(...listaTareas.map(t => t.id)) : 0
    const nueva = {
        id: ultimoId + 1,
        tarea,
        completada
    }

    listaTareas.push(nueva)
    console.log('Tarea creada:', nueva)

    res.send({ success: true, data: nueva })
})

servidor.get('/tareas/:id', (req, res) => {
    const id = Number(req.params.id)

    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const buscada = listaTareas.find(t => t.id === id)
    if (!buscada) {
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' })
    }

    res.json({ success: true, data: buscada })
})

servidor.delete('/tareas/:id', (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const encontrada = listaTareas.find(t => t.id === id)
    if (!encontrada) {
        return res.status(404).json({ success: false, message: 'Tarea no encontrada' })
    }

    listaTareas = listaTareas.filter(t => t.id !== id)
    console.log('Tarea eliminada:', encontrada)

    res.json({ success: true, data: encontrada })
})

servidor.listen(PUERTO, () => {
    console.log(`Servidor activo en el puerto ${PUERTO}`)
})
