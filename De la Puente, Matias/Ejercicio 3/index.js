const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

let tareas = [];
let nextId = 1;

const norm = (s) => String(s ?? "").trim();
const isValidId = (id) => Number.isInteger(id) && id >= 1;
const existeNombre = (nombre, exceptId = null) =>
  tareas.some(t => t.nombre.toLowerCase() === nombre.toLowerCase() && t.id !== exceptId);

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
  }
  return null; // inválido
};

const estadoValido = (e) => !e || ["completadas","pendientes"].includes(String(e).toLowerCase());

app.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post("/tareas", (req, res) => {
  let { nombre, completada } = req.body ?? {};
  nombre = norm(nombre);

  if (!nombre) {
    return res.status(400).json({ success: false, error: "nombre es requerido" });
  }
  if (existeNombre(nombre)) {
    return res.status(409).json({ success: false, error: "ya existe una tarea con ese nombre" });
  }

  let comp = false;
  if (completada !== undefined) {
    const b = toBool(completada);
    if (b === null) {
      return res.status(400).json({ success: false, error: "completada debe ser true o false" });
    }
    comp = b;
  }

  const tarea = { id: nextId++, nombre, completada: comp, ts: new Date().toISOString() };
  tareas.push(tarea);

  res.status(201).location(`/tareas/${tarea.id}`).json({ success: true, data: tarea });
});

app.get("/tareas", (req, res) => {
  const { estado } = req.query;

  if (!estadoValido(estado)) {
    return res.status(400).json({ success: false, error: 'estado debe ser "completadas" o "pendientes"' });
  }

  const data = !estado
    ? tareas
    : String(estado).toLowerCase() === "completadas"
      ? tareas.filter(t => t.completada)
      : tareas.filter(t => !t.completada);

  res.json({ success: true, data });
});

app.get("/tareas/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const t = tareas.find(x => x.id === id);
  if (!t) return res.status(404).json({ success: false, error: "No encontrado" });

  res.json({ success: true, data: t });
});

app.put("/tareas/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const t = tareas.find(x => x.id === id);
  if (!t) return res.status(404).json({ success: false, error: "No encontrado" });

  let { nombre, completada } = req.body ?? {};

  if (nombre !== undefined) {
    nombre = norm(nombre);
    if (!nombre) return res.status(400).json({ success: false, error: "nombre no puede estar vacío" });
    if (existeNombre(nombre, id)) {
      return res.status(409).json({ success: false, error: "ya existe una tarea con ese nombre" });
    }
    t.nombre = nombre;
  }

  if (completada !== undefined) {
    const b = toBool(completada);
    if (b === null) return res.status(400).json({ success: false, error: "completada debe ser true o false" });
    t.completada = b;
  }

  res.json({ success: true, data: t });
});

app.delete("/tareas/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: "id debe ser un entero >= 1" });
  }
  const idx = tareas.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ success: false, error: "No encontrado" });

  tareas.splice(idx, 1);
  res.status(204).send();
});

app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: "Error interno" });
});

app.listen(PORT, () => {
  console.log(`API Tareas corriendo en http://localhost:${PORT}`);
});
