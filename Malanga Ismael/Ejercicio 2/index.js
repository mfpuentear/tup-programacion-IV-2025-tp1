import express from 'express'

const app = express()
const port = 3000

app.use(express.json())

let alumnos = []
app.get('/', (req, res) => {
    res.send('Hola Mundo!')
})

app.get('/alumnos', (req, res) => {
    res.json({ success: true, data: alumnos })
})

app.post('/alumnos', (req, res) => {
    const { nombre, notas } = req.body
    if (!nombre || !Array.isArray(notas)) {
        return res.status(400).json({ success: false, message: 'Todos los campos (nombre, notas) son obligatorios' })
    }
    if (alumnos.some(item => item.nombre === nombre)) {
        return res.status(400).json({ success: false, message: 'El nombre ya existe' })
    }

    const maxId = alumnos.length ? Math.max(...alumnos.map(el => el.id)) : 0
    const nuevo = {
        id: maxId + 1,
        nombre,
        notas
    }

    alumnos.push(nuevo)
    console.log('Nuevo alumno creado:', nuevo)
    res.json({ success: true, data: nuevo })
})

app.get('/alumnos/:id', (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const alumno = alumnos.find(el => el.id === id)
    if (!alumno) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' })
    }

    const promedio = (alumno.notas.reduce((acc, n) => acc + n, 0) / alumno.notas.length).toFixed(2)
    const condicion = promedio >= 8 ? 'Promocionado' : promedio >= 6 ? 'Aprobado' : 'Reprobado'

    res.json({
        success: true,
        data: { ...alumno, promedio: Number(promedio), condicion }
    })
})

app.delete('/alumnos/:id', (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    const alumno = alumnos.find(el => el.id === id)
    if (!alumno) {
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' })
    }

    alumnos = alumnos.filter(el => el.id !== id)
    console.log('Alumno eliminado:', alumno)
    res.json({ success: true, data: alumno })
})

app.listen(port, () => {
    console.log(`app funcionando en el puerto ${port}`)
})
