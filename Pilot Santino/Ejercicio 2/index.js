import express from "express"

const app = express();
const port = 3000;

app.use(express.json());

// Arreglo para guardar los alumnos
const alumnos = [{ nombre: "Santino", notas: [5, 6, 10] }];

const expresionRegular = /^[A-Za-z]+$/; // Solo permite letras de la a-z en mayusculas o minusculas

// Funciona utiles para evitar repetir codigo en el post y put
function buscarAlumno(nombre) {
    return alumnos.find((a) => a.nombre.toLowerCase() === nombre.toLowerCase())
}

function obtenerCondicion(promedio) {
    if (promedio < 6) return "reprobado";
    if (promedio < 8) return "aprobado";
    return "promocionado";
}

function validarNotas(notas) {
    // Verificamos que sea un array
    if (!Array.isArray(notas)) {
        return "Las notas deben ser un array";
    }

    // Verificamos que tenga exactamente 3 elementos
    if (notas.length !== 3) {
        return "Deben ser exactamente 3 notas";
    }

    // Verificamos elementos vacios
    if (notas.some(n => (typeof n === "string" ? n.trim() === "" : n === null || n === undefined))) {
    return "No puede haber elementos vacios en el array";
}

    // Formateamos y verificamos si son numeros y estan en los limites permitidos (0 o 10)
    const notasFormateadas = notas.map((n) => Number(n))
    if (notasFormateadas.some(n => isNaN(n) || n < 0 || n > 10)) {
        return "Las notas son invalidas (deben ser 3 notas entre 0-10)";
    }

    return false; // Retornamos false para decir que no hay error
}

// GET para ver a todos los alumnos cargados
app.get("/alumnos", (req, res) => {
    res.json({ success: true, data: alumnos })
})

// GET para filtrar alumnos por su nombre
app.get("/alumnos/:nombre", (req, res) => {
    const nombre = req.params.nombre;
    // Verificamos que el nombre cumpla con el formato permitido 
    if (!expresionRegular.test(nombre)) {
        return res
            .status(400)
            .json({ success: false, message: "El parametro no cumple el formato (solo letras de la a/A-z/Z)" });
    }

    // Buscamos al alumno con ese nombre
    const alumno = buscarAlumno(nombre)

    // Verificamos si existe 
    if (alumno) {
        //Sacamos su promedio y lo devolvemos 
        let promedio = alumno.notas.reduce((acc, n) => acc + n, 0) / alumno.notas.length
        res.json({
            success: true,
            data: {
                ...alumno,
                promedio,
                condicion: obtenerCondicion(promedio)
            }
        })
    } else {
        res
            .status(404)
            .json({ success: false, message: "Ese alumno no esta cargado en el arreglo" })
    }
});

app.post("/alumnos", (req, res) => {
    const { nombre, notas } = req.body
    
    // Verificamos que se envien ambos campos
    if (!nombre || notas === undefined) {
        return res
            .status(400)
            .json({ success: false, message: "Ambos campos son obligatorios" });
    }

    // Verificamos que el nombre a agregar cumpla el formato
    if (!expresionRegular.test(nombre)) {
        return res
            .status(400)
            .json({ success: false, message: "El nombre no cumple el formato (solo letras de la a/A-z/Z)" });
    }

    // Buscamos si ese alumno ya existe
    const alumnoExistente = buscarAlumno(nombre)
    if (alumnoExistente) {
        return res
            .status(400)
            .json({ success: false, message: "Ese alumno ya esta cargado" });
    }

    // Validamos las notas usando la funcion auxiliar
    const errorNotas = validarNotas(notas);
    if (errorNotas) {
        return res
            .status(400)
            .json({ success: false, message: errorNotas });
    }

    // Formateamos las notas
    const notasFormateadas = notas.map((n) => Number(n))

    // Creamos al nuevo alumno y lo agregamos al arreglo
    const nuevoAlumno = {
        nombre,
        notas: notasFormateadas
    }

    alumnos.push(nuevoAlumno)
    return res.json({ success: true, data: nuevoAlumno })
});

app.put("/alumnos/:nombre", (req, res) => {
    const nombre = req.params.nombre;

    // Vemos si el alumno que queremos modificar existe
    const alumno = buscarAlumno(nombre)
    if (!alumno) {
        return res
            .status(404)
            .json({ success: false, message: "Ese alumno no esta cargado"});
    }

    const {nombre: nuevoNombre, notas} = req.body;

    // Vemos que no haya enviado el body vacio
    if (!nuevoNombre && notas === undefined) {
        return res.status(400).json({
            success: false,
            message: "Debe enviar al menos un campo para modificar"
        });
    }

    // Vemos si el nuevo nombre cumple el formato
    if (nuevoNombre) {
        if (!expresionRegular.test(nuevoNombre)) {
            return res
                .status(400)
                .json({ success: false, message: "El nuevo nombre no cumple el formato (solo letras de la a/A-z/Z)" });
        }

        // Vemos si existe un alumno con el nuevo nombre que queremos poner
        const alumnoDuplicado = buscarAlumno(nuevoNombre)
        // Vemos si existe uno y que no sea el que estamos modificando (en el caso de que solo estamos cambiando las notas y no el nombre)
        if (alumnoDuplicado && alumnoDuplicado !== alumno) {
            return res
                .status(400)
                .json({ success: false, message: "Ya existe un alumno con ese nombre" });
        }

        // Cambiamos el nombre por el nuevo
        alumno.nombre = nuevoNombre;
    }

    // En el caso de que se envien notas
    if (notas !== undefined) {
        // Validamos las notas usando la funcion que ya teniamos
        const errorNotas = validarNotas(notas);
        if (errorNotas) {
            return res
                .status(400)
                .json({ success: false, message: errorNotas });
        }

        // Formateamos las notas 
        const notasFormateadas = notas.map(n => Number(n));
        
        // Cambiamos las notas 
        alumno.notas = notasFormateadas;
    }

    res.json({
        success: true, data: alumno
    });
});

app.listen(port, () => {
    console.log("La app esta funcionando en el puerto:", port);
});