import express from 'express';


const app = express();
const port = 3000;

app.use(express.json());

let tareas = [];

app.get('/tareas', (req, res) => {
    const { completada } = req.query;
    if (completada === 'true') {
        return res.json(tareas.filter(tarea => tarea.completada));
    } else if (completada === 'false') {
        return res.json(tareas.filter(tarea => !tarea.completada));
    }

    res.json(tareas);
});

app.post('/tareas', (req, res) => {
    const { nombre, completada } = req.body;
    if (tareas.some(tarea => tarea.nombre === nombre)) {
        return res.status(400).json({ error: 'La tarea ya existe' });
    }
    const nuevaTarea = { nombre, completada: !!completada };
    tareas.push(nuevaTarea);
    res.status(201).json(nuevaTarea);
});




app.listen(port, () => {
    console.log(`Servidor funcionando en: ${port}`);
});    