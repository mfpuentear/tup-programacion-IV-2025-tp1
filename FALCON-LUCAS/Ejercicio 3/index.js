import express from 'express'
const app = express()
const port = 3000
app.use(express.json())
let pendientes = []

app.get('/', (req, res) => res.send('Hola Mundo!'))

app.get('/tareas', (req, res) => {
    const { completada } = req.query
    if (!pendientes.length) return res.status(404).json({ success: false, message: 'No hay tareas disponibles' })
    let filtradas = pendientes
    if (completada !== undefined) filtradas = pendientes.filter(t => t.completada === (completada === 'true'))
    res.json({ success: true, data: filtradas })
})

app.post('/tareas', (req, res) => {
    const { descripcion, completada } = req.body
    if (!descripcion || completada === undefined) return res.status(400).json({ success: false, message: 'Datos obligatorios' })
    if (pendientes.some(t => t.descripcion === descripcion)) return res.status(400).json({ success: false, message: 'Tarea repetida' })
    const id = pendientes.length ? Math.max(...pendientes.map(t => t.id)) + 1 : 1
    const nueva = { id, descripcion, completada }
    pendientes.push(nueva)
    res.json({ success: true, data: nueva })
})

app.get('/tareas/:id', (req, res) => {
    const id = Number(req.params.id)
    const tarea = pendientes.find(t => t.id === id)
    if (!tarea) return res.status(404).json({ success: false, message: 'No encontrada' })
    res.json({ success: true, data: tarea })
})

app.delete('/tareas/:id', (req, res) => {
    const id = Number(req.params.id)
    const idx = pendientes.findIndex(t => t.id === id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'No encontrada' })
    const eliminada = pendientes.splice(idx, 1)[0]
    res.json({ success: true, data: eliminada })
})

app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`)
})