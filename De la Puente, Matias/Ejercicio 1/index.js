const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

let registros = [];
let nextId = 1;

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function isPositive(n) {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}
function isValidId(id) {
  return Number.isInteger(id) && id >= 1;
}
function isValidTipo(q) {
  if (q === undefined) return true;
  const v = String(q).toLowerCase();
  return v === "cuadrado" || v === "rectangulo";
}
function tipo(base, altura) {
  return base === altura ? "Cuadrado" : "Rectángulo";
}

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/rectangulos", (req, res) => {
  let { base, altura } = req.body ?? {};

  base = toNumber(base);
  altura = toNumber(altura);

  if (!isPositive(base) || !isPositive(altura)) {
    return res
      .status(400)
      .json({ success: false, error: "base y altura deben ser números > 0" });
  }

  const perimetro = 2 * (base + altura);
  const superficie = base * altura;
  
  const registro = {
    id: nextId++,
    base,
    altura,
    perimetro,
    superficie,
    ts: new Date().toISOString(),
  };

  registros.push(registro);

  res
    .status(201)
    .location(`/rectangulos/${registro.id}`)
    .json({ success: true, data: { ...registro, tipo: tipo(base, altura) } });
});


app.get("/rectangulos", (req, res) => {
  const { tipo: q } = req.query;

  if (!isValidTipo(q)) {
    return res
      .status(400)
      .json({ success: false, error: 'tipo debe ser "cuadrado" o "rectangulo"' });
  }

  const lista = registros.map((r) => ({ ...r, tipo: tipo(r.base, r.altura) }));

  const data =
    !q
      ? lista
      : String(q).toLowerCase() === "cuadrado"
        ? lista.filter((x) => x.tipo === "Cuadrado")
        : lista.filter((x) => x.tipo === "Rectángulo");

  res.json({ success: true, data });
});

app.get("/rectangulos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res
      .status(400)
      .json({ success: false, error: "id debe ser un entero >= 1" });
  }

  const r = registros.find((x) => x.id === id);
  if (!r) return res.status(404).json({ success: false, error: "No encontrado" });

  res.json({ success: true, data: { ...r, tipo: tipo(r.base, r.altura) } });
});

app.delete("/rectangulos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res
      .status(400)
      .json({ success: false, error: "id debe ser un entero >= 1" });
  }

  const idx = registros.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "No encontrado" });
  }

  registros.splice(idx, 1);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Error interno" });
});

app.listen(PORT, () => {
  console.log(`API Rectángulos corriendo en http://localhost:${PORT}`);
});
