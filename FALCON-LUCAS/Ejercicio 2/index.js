import express from 'express'
const app = express()
const port = 3000
app.use(express.json())
let lista = []

app.get('/', (req, res) => res.send('Hola Mundo!'))

app.get('/alumnos', (req, res) => res.json({ success: true, data: lista }))

app.post('/alumnos', (req, res) => {
    const { nombre, notas } = req.body
    if (!nombre || !Array.isArray(notas)) return res.status(400).json({ success: false, message: 'Datos inválidos' })
    if (lista.some(e => e.nombre === nombre)) return res.status(400).json({ success: false, message: 'Nombre repetido' })
    const id = lista.length ? Math.max(...lista.map(e => e.id)) + 1 : 1
    const nuevo = { id, nombre, notas }
    lista.push(nuevo)
    res.json({ success: true, data: nuevo })
})

app.get('/alumnos/:id', (req, res) => {
    const id = Number(req.params.id)
    const alumno = lista.find(e => e.id === id)
    if (!alumno) return res.status(404).json({ success: false, message: 'No encontrado' })
    const promedio = alumno.notas.reduce((a, b) => a + b, 0) / alumno.notas.length
    const condicion = promedio >= 8 ? 'Promocionado' : promedio >= 6 ? 'Aprobado' : 'Reprobado'
    res.json({ success: true, data: { ...alumno, promedio: Number(promedio.toFixed(2)), condicion } })
})

app.delete('/alumnos/:id', (req, res) => {
    const id = Number(req.params.id)
    const idx = lista.findIndex(e => e.id === id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'No encontrado' })
    const eliminado = lista.splice(idx, 1)[0]
    res.json({ success: true, data: eliminado })
})

app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`)
})