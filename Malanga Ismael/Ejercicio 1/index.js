import express from "express"
const servidor = express()
const PUERTO = 3000

servidor.use(express.json())
let calculos = []

servidor.get("/", (req, res) => {
    res.send("Bienvenido profee!")
})

servidor.get("/calculos", (req, res) => {
    res.json({
        ok: true,
        calculos
    })
})

servidor.post("/calculos", (req, res) => {
    const { base, altura } = req.body
    if (base == null || altura == null) {
        return res.status(400).json({
            ok: false,
            mensaje: "Faltan datos: base y altura son obligatorios"
        })
    }
    if (typeof base !== 'number' || typeof altura !== 'number' || base <= 0 || altura <= 0) {
        return res.status(400).json({ success: false, message: 'La base y la altura deben ser positivos' })
    }

    const nuevoId = calculos.length ? Math.max(...calculos.map(c => c.id)) + 1 : 1
    const nuevo = {
        id: nuevoId,
        base,
        altura,
        area: base * altura,
        perimetro: (base + altura) * 2
    }

    calculos.push(nuevo)
    console.log("Se agregó un nuevo cálculo:", nuevo)
    res.json({
        ok: true,
        data: nuevo
    })
})

servidor.get("/calculos/:id", (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "El ID debe ser un número válido"
        })
    }

    const buscado = calculos.find(c => c.id === id)
    if (!buscado) {
        return res.status(404).json({
            ok: false,
            mensaje: "No se encontró un cálculo con ese ID"
        })
    }
    res.json({
        ok: true,
        encontrado: buscado
    })
})

servidor.delete("/calculos/:id", (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "El ID no es válido"
        })
    }

    const buscado = calculos.find(c => c.id === id)
    if (!buscado) {
        return res.status(404).json({
            ok: false,
            mensaje: "No existe un cálculo con ese ID"
        })
    }

    calculos = calculos.filter(c => c.id !== id)
    console.log("Se eliminó el cálculo:", buscado)
    res.json({
        ok: true,
        eliminado: buscado
    })
})
servidor.listen(PUERTO, () => {
    console.log(`Servidor iniciado en el puerto ${PUERTO}`)
})
