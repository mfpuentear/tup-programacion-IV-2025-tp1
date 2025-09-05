import express from "express"

const app = express();
const port = 3000;

app.use(express.json())

// Arreglo que va a guardar los calculos
const calculos = [];

// POST para ingresar datos del calculo
app.post("/calculos", (req, res) => {
    const { base, altura } = req.body;

    // Verifica que no esten vacios
    if (base && altura) {
        // Los formatea a numeros
        const baseFormateada = Number(base);
        const alturaFormateada = Number(altura);
        // Verifica si son numeros 
        if ((isNaN(baseFormateada) || isNaN(alturaFormateada)) || (baseFormateada <= 0 || alturaFormateada <= 0)) {
            return res
                .status(400)
                .json({ success: false, message: "Datos mal ingresados" });
        };
        // Guardamos los calculos en variabels nuevas y creamos un nuevo objeto
        const perimetro = 2 * (baseFormateada + alturaFormateada);
        const superficie = baseFormateada * alturaFormateada;
        const nuevoCalculo = {
            base: baseFormateada,
            altura: alturaFormateada,
            perimetro,
            superficie,
        };
        // Agregamos el objeto al arreglo y damos una respuesta a la peticion
        calculos.push(nuevoCalculo);
        res.json({ success: true, data: nuevoCalculo });
    } else {
        return res
            .status(400)
            .json({ success: false, message: "Los datos no pueden estar vacios" });
    };

});

// GET para obtener todos los calculos
app.get("/calculos", (req, res) => {
    // Este vacio o no lo mostramos ya que la peticion se atendio bien, solo que no hay calculos en el arreglo
    return res.json({
        success: true, data: calculos.map(c => (
            {
                ...c,
                tipo: c.base === c.altura ? "cuadrado" : "rectangulo"
            }))
    });
})

app.listen(port, () => {
    console.log("La aplicacion esta funcionando en el puerto:", port)
});