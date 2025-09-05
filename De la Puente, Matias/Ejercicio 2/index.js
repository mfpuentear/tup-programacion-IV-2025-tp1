const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

let alumnos = [];
let nextId = 1;

const norm = (s) => String(s ?? "").trim();
const toNum = (v) => {
  if (typeof v === "string" && v.trim() === "") return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};
const isNota = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 10;
const isValidId = (id) => Number.isInteger(id) && id >= 1;
const existeNombre = (nombre, exceptId = null) =>
  alumnos.some(a => a.nombre.toLowerCase() === nombre.toLowerCase() && a.id !== exceptId);

const promedio = (a) => +( (a.n1 + a.n2 + a.n3) / 3 ).toFixed(2);
const condicion = (prom) => prom < 6 ? "reprobado" : (prom < 8 ? "aprobado" : "promocionado");
const derivados = (a) => {
  const prom = promedio(a);
  return { ...a, promedio: prom, condicion: condicion(prom) };
};
const isValidEstado = (e) => !e || ["reprobado","aprobado","promocionado"].includes(String(e).toLowerCase());

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/alumnos", (req, res) => {
  let { nombre, n1, n2, n3 } = req.body ?? {};
  nombre = norm(nombre);
  n1 = toNum(n1); n2 = toNum(n2); n3 = toNum(n3);

  if (!nombre) {
    return res.status(400).json({ success: false, error: "nombre es requerido" });
  }
  if (existeNombre(nombre)) {
    return res.status(409).json({ success: false, error: "ya existe un alumno con ese nombre" });
  }
  if (!isNota(n1) || !isNota(n2) || !isNota(n3)) {
    return res.status(400).json({ success: false, error: "las notas deben ser números entre 0 y 10" });
  }

  const alumno = { id: nextId++, nombre, n1, n2, n3, ts: new Date().toISOString() };
  alumnos.push(alumno);

  res.status(201).location(`/alumnos/${alumno.id}`).json({ success: true, data: derivados(alumno) });
});

app.get("/alumnos", (req, res) => {
  const { estado } = req.query;
  if (!isValidEstado(estado)) {
    return res.status(400).json({ success: false, error: 'estado debe ser "reprobado","aprobado" o "promocionado"' });
  }

  const lista = alumnos.map(derivados);
  const data = estado ? lista.filter(a => a.condicion === String(estado).toLowerCase()) : lista;

  res.json({ success: true, data });
});

app.get("/alumnos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const a = alumnos.find(x => x.id === id);
  if (!a) return res.status(404).json({ success: false, error: "No encontrado" });

  res.json({ success: true, data: derivados(a) });
});

app.put("/alumnos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const a = alumnos.find(x => x.id === id);
  if (!a) return res.status(404).json({ success: false, error: "No encontrado" });

  let { nombre, n1, n2, n3 } = req.body ?? {};
  if (nombre !== undefined) {
    nombre = norm(nombre);
    if (!nombre) return res.status(400).json({ success: false, error: "nombre no puede estar vacío" });
    if (existeNombre(nombre, id)) {
      return res.status(409).json({ success: false, error: "ya existe un alumno con ese nombre" });
    }
    a.nombre = nombre;
  }
  if (n1 !== undefined) { n1 = toNum(n1); if (!isNota(n1)) return res.status(400).json({ success: false, error: "n1 inválida (0-10)" }); a.n1 = n1; }
  if (n2 !== undefined) { n2 = toNum(n2); if (!isNota(n2)) return res.status(400).json({ success: false, error: "n2 inválida (0-10)" }); a.n2 = n2; }
  if (n3 !== undefined) { n3 = toNum(n3); if (!isNota(n3)) return res.status(400).json({ success: false, error: "n3 inválida (0-10)" }); a.n3 = n3; }

  res.json({ success: true, data: derivados(a) });
});

app.delete("/alumnos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const idx = alumnos.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "No encontrado" });

  alumnos.splice(idx, 1);
  res.status(204).send();
});

app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Error interno" });
});

app.listen(PORT, () => {
  console.log(`API Alumnos corriendo en http://localhost:${PORT}`);
});
