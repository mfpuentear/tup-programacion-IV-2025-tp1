import express from 'express'
const app = express()
const port = 3000
app.use(express.json())
let calculos = []

app.get('/', (req, res) => res.send('Hola Mundo!'))

app.get('/calculos', (req, res) => res.json({ success: true, data: calculos }))

app.post('/calculos', (req, res) => {
    const { base, altura } = req.body
    if (base == null || altura == null) return res.status(400).json({ success: false, message: 'Faltan datos' })
    const id = calculos.length ? Math.max(...calculos.map(c => c.id)) + 1 : 1
    const nuevo = { id, base, altura, area: base * altura, perimetro: 2 * (base + altura) }
    calculos.push(nuevo)
    res.json({ success: true, data: nuevo })
})

app.get('/calculos/:id', (req, res) => {
    const id = Number(req.params.id)
    const calc = calculos.find(c => c.id === id)
    if (!calc) return res.status(404).json({ success: false, message: 'No encontrado' })
    res.json({ success: true, data: calc })
})

app.delete('/calculos/:id', (req, res) => {
    const id = Number(req.params.id)
    const idx = calculos.findIndex(c => c.id === id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'No encontrado' })
    const eliminado = calculos.splice(idx, 1)[0]
    res.json({ success: true, data: eliminado })
})

app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`)
})