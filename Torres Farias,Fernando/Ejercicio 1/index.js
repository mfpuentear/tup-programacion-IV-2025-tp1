import express, { json, text } from "express"

const app = express()
const port = 5000

app.use(express.json());


let calculos = []



app.post('/calculos', (req, res) => {
 const  {base , altura} = req.body;

 if(!base || !altura || base <= 0 || altura <= 0){
    res.status(404).json({error: "La base y altura no puede ser negativos"});}
 else{  
 const superficie = base * altura
 const perimetro = 2 * (base + altura) 
 calculos.push({base,altura,superficie,perimetro})
 res.json({message: "Se agrego con exito los datos!"})}

}) 





app.get('/calculos', (req, res) => {
 const resultados = calculos.map(figura => ({
  ...figura, tipo : figura.base === figura.altura ? "cuadrado" : "rectangulo"
 })) 
 res.json(resultados);

});
 



app.listen(port, () => {
  console.log(`La aplicacion esta funcionando en ${port}`)
})
