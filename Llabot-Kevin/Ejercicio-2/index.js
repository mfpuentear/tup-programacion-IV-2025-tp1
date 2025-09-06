import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

let alumnos = [];
let id = 1;

app.post('/alumnos', (req, res) => {

    const { nombre, notas } = req.body;

  if (!nombre || !Array.isArray(notas) || notas.length !== 3) {
    return res.status(400).json({ error: 'Nombre y tres notas son requeridos.' });
  }
  if (notas.some(n => n < 0 || n > 10)) {
    return res.status(400).json({ error: 'Las notas deben estar entre 0 y 10.' });
  }
  if (alumnos.some(alumno => alumno.nombre === nombre)) {
    return res.status(400).json({ error: 'El alumno ya existe.' });
  }
    const alumno = { id: id++, nombre, notas };
    alumnos.push(alumno);
    res.json(alumno);
});

app.get('/alumnos', (req, res) => {

    const resultado = alumnos.map(alumno => {

        const promedio = alumno.notas.reduce((a, b) => a + b, 0) / alumno.notas.length;     
        let estado;
        if (promedio < 6) {
            estado = 'reprobado';
        } else if (promedio < 8) {
            estado = 'aprobado';
        } else {
            estado = 'promocionado';
        }
        return { ...alumno, promedio, estado };
    });
    res.json(resultado);
});

app.put('/alumnos/:id', (req, res) => {
    const alumnoId = parseInt(req.params.id);
    const { nombre, notas } = req.body; 
    const alumnoIndex = alumnos.findIndex(a => a.id === alumnoId);

    if (alumnoIndex === -1) {
        return res.status(404).json({ error: 'Alumno no encontrado.' });
    }
    if (!nombre || !Array.isArray(notas) || notas.length !== 3) {
        return res.status(400).json({ error: 'Nombre y tres notas son requeridos.' });
    }
    if (notas.some(n => n < 0 || n > 10)) {
        return res.status(400).json({ error: 'Las notas deben estar entre 0 y 10.' });
    }
    if (alumnos.some((alumno, index) => alumno.nombre === nombre && index !== alumnoIndex)) {
        return res.status(400).json({ error: 'El alumno ya existe.' });
    }
    alumnos[alumnoIndex] = { id: alumnoId, nombre, notas };
    res.json(alumnos[alumnoIndex]);
});



app.listen(port, () => {
    console.log(`Servidor funcionando en: ${port}`);
});    