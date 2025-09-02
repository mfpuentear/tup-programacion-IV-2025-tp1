//Realizar una API con ExpressJS que permita calcular perímetros y superficies
//de rectángulos. Guardar los cálculos en un arreglo interno. En el momento de
//consultar por los cálculos indicar también si se trata de un rectángulo o
//cuadrado, no guardar este dato en el arreglo interno.

import express from 'express';


const app = express();
const port = 3000;

app.use(express.json());

let calculos = [];
let id = 1;

app.post('/calcular', (req, res) => {
    const  {ancho, alto} = req.body; 
    let numAncho = parseFloat(ancho);
    let numAlto = parseFloat(alto);

    if (isNaN(numAncho) || isNaN(numAlto) || numAncho <= 0 || numAlto <= 0) {
        return res.status(400).json({ error: 'Ancho y alto deben ser números positivos.' });
    }
    const perimetro = 2 * (numAncho + numAlto);
    const superficie = numAncho * numAlto;
    const calculo = { id: id++, ancho: numAncho, alto: numAlto, perimetro, superficie };
    calculos.push(calculo);
    res.json(calculo);
} );


app.get('/calculos', (req, res) => {
    calculos = calculos.map(calculo => {
        const tipo = (calculo.ancho === calculo.alto) ? 'cuadrado' : 'rectángulo';
        return { ...calculo, tipo };
    });

    res.json(calculos);
});     


app.listen(port, () => {
    console.log(`Servidor funcionando en: ${port}`);
});    