import React, { useState, useEffect } from "react";
import tipoCatalogoService from "./tipoCatalogoService";

const FrmTipoCatalogo = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [form, setForm] = useState({
    idTipoCatalogo: 0,
    nombre: "",
    descripcion: "",
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  const cargarTipos = async () => {
    setLoading(true);
    try {
      const res = await tipoCatalogoService.listarTiposCatalogo();
      setTipos(res || []);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Error al cargar tipos de catálogo.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(old => ({ ...old, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      idTipoCatalogo: 0,
      nombre: "",
      descripcion: "",
    });
    setModoEdicion(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const cargarParaEditar = (tipo) => {
    setForm({
      idTipoCatalogo: tipo.idTipoCatalogo || tipo.IdTipoCatalogo || 0,
      nombre: tipo.nombre || tipo.Nombre || "",
      descripcion: tipo.descripcion || tipo.Descripcion || "",
    });
    setModoEdicion(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setErrorMsg("El nombre es obligatorio.");
      return;
    }

    try {
      let res;
      if (modoEdicion) {
        res = await tipoCatalogoService.actualizarTipoCatalogo(form);
      } else {
        res = await tipoCatalogoService.insertarTipoCatalogo(form);
      }

      if (res.success === false || res.success === undefined) {
        setErrorMsg(res.message || "Error en la operación.");
      } else {
        setSuccessMsg("Operación realizada con éxito.");
        resetForm();
        cargarTipos();
      }
    } catch (error) {
      setErrorMsg("Error inesperado en la operación.");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>{modoEdicion ? "Editar Tipo de Catálogo" : "Nuevo Tipo de Catálogo"}</h2>

      {errorMsg && <div style={{ color: "red", marginBottom: 10 }}>{errorMsg}</div>}
      {successMsg && <div style={{ color: "green", marginBottom: 10 }}>{successMsg}</div>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        </div>

        <div style={{ marginTop: 15 }}>
          <button type="submit" style={{ marginRight: 10 }}>
            {modoEdicion ? "Actualizar" : "Registrar"}
          </button>
          <button type="button" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <h2>Tipos de Catálogo</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : errorMsg ? (
        <p style={{ color: "red" }}>{errorMsg}</p>
      ) : tipos.length === 0 ? (
        <p>No hay tipos de catálogo registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo) => (
              <tr key={tipo.idTipoCatalogo || tipo.IdTipoCatalogo}>
                <td>{tipo.idTipoCatalogo || tipo.IdTipoCatalogo}</td>
                <td>{tipo.nombre || tipo.Nombre}</td>
                <td>{tipo.descripcion || tipo.Descripcion}</td>
                <td>
                  <button onClick={() => cargarParaEditar(tipo)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FrmTipoCatalogo;
