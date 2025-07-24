import React, { useEffect, useState } from "react";
import evaluacionService from "./services/RescateEvaluacion";

const FrmEvaluaciones = () => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    idEvaluacion: 0,
    nombre: "",
    descripcion: "",
    fecha: "",
    estado: ""
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  const cargarEvaluaciones = async () => {
    setLoading(true);
    try {
      const res = await evaluacionService.listarEvaluacionesRescatables();
      setEvaluaciones(res || []);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Error cargando evaluaciones.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(old => ({ ...old, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      idEvaluacion: 0,
      nombre: "",
      descripcion: "",
      fecha: "",
      estado: ""
    });
    setModoEdicion(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const cargarParaEditar = (evaluacion) => {
    setForm({
      idEvaluacion: evaluacion.idEvaluacion || 0,
      nombre: evaluacion.nombre || "",
      descripcion: evaluacion.descripcion || "",
      fecha: evaluacion.fecha || "",
      estado: evaluacion.estado || ""
    });
    setModoEdicion(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim() || !form.fecha.trim()) {
      setErrorMsg("Nombre y fecha son obligatorios.");
      return;
    }

    try {
      let res;
      if (modoEdicion) {
        res = await evaluacionService.actualizarEvaluacion(form);
      } else {
        res = await evaluacionService.insertarEvaluacion(form);
      }
      if (res.success === false || res.success === undefined) {
        setErrorMsg(res.message || "Error en la operación.");
      } else {
        setSuccessMsg("Operación realizada con éxito.");
        resetForm();
        cargarEvaluaciones();
      }
    } catch (error) {
      setErrorMsg("Error inesperado en la operación.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>{modoEdicion ? "Editar Evaluación" : "Nueva Evaluación"}</h2>

      {errorMsg && <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: "green", marginBottom: 10 }}>{successMsg}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre *"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
          />
          <input
            type="date"
            name="fecha"
            placeholder="Fecha *"
            value={form.fecha}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="estado"
            placeholder="Estado"
            value={form.estado}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: 15 }}>
          <button type="submit" style={{ marginRight: 10 }}>
            {modoEdicion ? "Actualizar" : "Registrar"}
          </button>
          <button type="button" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <h2>Evaluaciones</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : errorMsg ? (
        <p style={{ color: "red" }}>{errorMsg}</p>
      ) : evaluaciones.length === 0 ? (
        <p>No hay evaluaciones registradas.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.map((ev) => (
              <tr key={ev.idEvaluacion || ev.IdEvaluacion}>
                <td>{ev.idEvaluacion || ev.IdEvaluacion}</td>
                <td>{ev.nombre || ev.Nombre}</td>
                <td>{ev.descripcion || ev.Descripcion}</td>
                <td>{ev.fecha || ev.Fecha}</td>
                <td>{ev.estado || ev.Estado}</td>
                <td>
                  <button onClick={() => cargarParaEditar(ev)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FrmEvaluaciones;
