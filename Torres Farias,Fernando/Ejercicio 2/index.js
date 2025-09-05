import express, { json, text } from "express"

const app = express()
const port = 5000

app.use(express.json());


const alumnos = []

let id = 0

app.post('/alumnos', (req, res) => {
  const {nombre , notas} = req.body;
  
  if(!nombre || !Array.isArray(notas) || notas.length !== 3 ){
    res.status(400).json({error: "Los datos ingresados para el alumno son incorrectos"})
  }
  else if(notas.some(nota => nota < 0 || nota > 10)){
    res.status(400).json({error : "Las notas no deben ser menor a 0 y no deben superar el 10"})

  }
  else if(alumnos.some(n => n.nombre === nombre)){
    res.status(400).json({error: "El nombre del alumno ya se encuentra en el listado"})
  }
  else{
    alumnos.push({ id: id++ ,nombre,notas})
    res.json("Se agrego con exito el alumno!")
  }


}) 





app.get('/alumnos', (req, res) => {
  const resultado = alumnos.map(alumno => {
    const promedio = alumno.notas.reduce((acc, nota) => acc + nota, 0) / alumno.notas.length;
    
    let estado = "";
    if (promedio < 6) {
      estado = "Reprobado";
    } else if (promedio >= 6 && promedio < 8) {
      estado = "Aprobado";
    } else {
      estado = "Promocionado";
    }

    return { ...alumno, promedio, estado };
  });

  res.json(resultado);
});


app.put('/alumnos/:id',(req,res) => {
  const id = parseInt(req.params.id);
  const { NuevoNombre, notas } = req.body;

  const alumno = alumnos.find(a => a.id === id);

  if (!alumno) {
    return res.status(404).json({ error: "Alumno no encontrado" });
  }
  if (alumnos.some(a => a.nombre === NuevoNombre && a.id !== id)) {
    return res.status(400).json({ error: "Ya existe un alumno con ese nombre" });
  }

  if (!Array.isArray(notas) || notas.length !== 3 ) {
    return res.status(400).json({ error: "Las notas deben ser un arreglo de 3 números" });
  }

  alumno.nombre = NuevoNombre;
  alumno.notas = notas;

  res.json({ mensaje: "Alumno actualizado con éxito", alumno });
});






app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`)
})
