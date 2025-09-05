import express, { json, text } from "express"

const app = express()
const port = 5000

app.use(express.json());


const tareas = []

let id = 0

app.post('/tareas', (req, res) => {
const {tarea,estado} = req.body;

if(!tarea || estado === null){
  res.status(400).json({error:"La tarea y estado no pueden estar vacios!"})
}
else if(tareas.some(t=> t.tarea === tarea)){
  res.status(400).json({error:"La tarea ya se encuentra registrada"})

}
else{
  res.json("Se guardo con exito la tarea")
  tareas.push({id: id++,tarea,estado})
}

}) 











app.get('/tareas/',(req,res) => {
 const resultado = tareas.filter(t => t.estado === false)
 res.json(resultado)
});






app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`)
})
