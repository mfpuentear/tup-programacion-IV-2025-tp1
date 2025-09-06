import express from "express"

const app = express()
const port = 3000

app.use(express.json())

// Array donde vamos a guardar las tareas
const tareas = [{ tarea: "programar", completada: true }]
const expresionRegular = /^[A-Za-z\s]+$/; // Solo permite letras de la a-z en mayusculas o minusculas y espacios

// Funciones utiles para no repetir codigo
function filtrarTareas(bool) {
    return tareas.filter((t) => t.completada === bool)
}

function buscarTarea(nombre) {
    return tareas.find(t => t.tarea.trim().toLowerCase() === nombre.trim().toLowerCase());
}

// Funcion para validar el nombre de la tarea
function validarNombreTarea(tarea) {
    // Verificamos que sea string (no numeros, null, etc)
    if (typeof tarea !== "string") {
        return "La tarea debe ser un texto";
    }

    // Verificamos que no este vacio
    if (tarea.trim() === "") {
        return "La tarea no puede estar vacia";
    }

    // Verificamos que cumpla el formato
    if (!expresionRegular.test(tarea)) {
        return "El nombre de la tarea es invalido (solo letras y espacios)";
    }

    return false; // retornamos false para decir que no hay error
}

app.get("/tareas", (req, res) => {
    const completadas = req.query.completadas

    // Si no hay parametro de consulta le damos todas
    if (completadas === undefined) {
        return res.json({ success: true, data: tareas });
    }

    // En el caso de que haya, verificamos que sea uno valido
    if (completadas !== "true" && completadas !== "false") {
        return res
            .status(400)
            .json({ 
                success: false, 
                message: "El parametro `completadas` debe ser 'true' o 'false'" 
            });
    }

    // Devolvemos con el filtro
    return res.json({ success: true, data: completadas === "true" ? filtrarTareas(true) : filtrarTareas(false)});
})

app.post("/tareas", (req, res) => {
    const {tarea, completada} = req.body;
    
    // Verificamos que existan los dos campos
    if (!tarea || completada === undefined) {
        return res
            .status(400)
            .json({ success: false, message: "Los campos son obligatorios" });
    }

    // Validamos el nombre de la tarea usando la funcion que ya teniamos
    const errorTarea = validarNombreTarea(tarea);
    if (errorTarea) {
        return res
            .status(400)
            .json({ success: false, message: errorTarea });
    }

    // Verificamos que completada sea true o false
    if (typeof completada !== "boolean") {
        return res
            .status(400)
            .json({ success: false, message: "El campo `completadas` debe ser un booleano (true o false)" });
    }

    // Buscamos si esa tarea ya existe
    const tareaExistente = buscarTarea(tarea.trim());
    if (tareaExistente) {
        return res
            .status(400)
            .json({ success: false, message: "Esa tarea ya existe" });
    }

    // Creamos la nueva tarea y la agregamos al arreglo
    const tareaNueva = {
        tarea: tarea.trim().toLowerCase(),
        completada
    };
    
    tareas.push(tareaNueva);
    res.json({ success: true, data: tareaNueva });
});

app.listen(port, () => {
    console.log("La app esta funcionando en el puerto:", port)
})