import express from 'express'

// Inicializar la aplicación
const app = express()
const port = 3000
app.use(express.json())

let alumnos = []

// ---------------- Ruta principal
app.get('/', (req, res) => {
    // Responde con string
    res.send('Hola Mundo!')
})

// <----------------> OBTENER ALUMNOS <---------------->
app.get('/alumnos', (req, res) => {
    // Respuesta final
    res.json({ success: true, data: alumnos })
})

// <----------------> CREAR CÁLCULO <---------------->
app.post('/alumnos', (req, res) => {
    // Crear un nuevo alumno
    const { nombre, notas } = req.body

    // Validar que todos los campos estén presentes
    if (nombre === undefined || !Array.isArray(notas)) {
        return res.status(400).json({ success: false, message: 'Todos los campos (nombre, notas) son obligatorios' })
    }

    // Validar que los nombres no se repitan
    if (alumnos.some(a => a.nombre === nombre)) {
        return res.status(400).json({ success: false, message: 'El nombre ya existe' })
    }

    // Buscar el ID máximo actual y sumar 1
    const maxId = alumnos.length > 0 ? Math.max(...alumnos.map(a => a.id)) : 0
    
    // Crear el nuevo alumno
    const nuevoAlumno = {
        id: maxId + 1,
        nombre,
        notas
    }

    // Agregar el nuevo alumno al arreglo
    alumnos.push(nuevoAlumno)

    console.log('Nuevo alumno creado:', { id: nuevoAlumno.id, nombre: nuevoAlumno.nombre, notas: nuevoAlumno.notas })

    // Responder con el nuevo alumno
    res.send({ success: true, data: { id: nuevoAlumno.id, nombre: nuevoAlumno.nombre, notas: nuevoAlumno.notas } })
})

// <----------------> OBTENER ALUMNO POR ID <---------------->
app.get('/alumnos/:id', (req, res) => {
    // Obtener el ID del alumno
    const id = Number(req.params.id)

    // Validar id
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
    }

    // Buscar el alumno por ID
    const alumno = alumnos.find(a => a.id === id)
    if (!alumno) {
        // Si no se encuentra el alumno, se devuelve un error 404
        return res.status(404).json({ success: false, message: 'Alumno no encontrado' })
    }

    // Calcular el promedio y la condición
    const promedio = (alumno.notas.reduce((acc, curr) => acc + curr, 0) / alumno.notas.length).toFixed(2)
    const condicion = (promedio >= 8) ? 'Promocionado' : (promedio >= 6) ? 'Aprobado' : 'Reprobado'

    // Si se encuentra el alumno, se devuelve en la respuesta
    res.json({ success: true, data: { id: alumno.id, nombre: alumno.nombre, notas: alumno.notas, promedio: Number(promedio), condicion } })
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