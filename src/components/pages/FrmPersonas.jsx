import React, { useEffect, useState } from "react";
import personasService from "../../services/Persona"; // el archivo que me pasaste

const FrmPersonas = () => {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form state
  const [form, setForm] = useState({
    idPersona: 0,
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    generoId: "",
    tipoDocumentoId: "",
    numeroDocumento: "",
    nacionalidadId: "",
    carreraId: "",
    idEstado: ""
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  // Cargar lista personas
  const cargarPersonas = async () => {
    setLoading(true);
    const res = await personasService.listarPersonas();
    if (res.success) {
      setPersonas(res.data);
      setErrorMsg(null);
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPersonas();
  }, []);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((old) => ({ ...old, [name]: value }));
  };

  // Reset formulario
  const resetForm = () => {
    setForm({
      idPersona: 0,
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      generoId: "",
      tipoDocumentoId: "",
      numeroDocumento: "",
      nacionalidadId: "",
      carreraId: "",
      idEstado: ""
    });
    setModoEdicion(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Cargar datos en el formulario para editar
  const cargarParaEditar = (persona) => {
    setForm({
      idPersona: persona.IdPersona || 0,
      primerNombre: persona.PrimerNombre || "",
      segundoNombre: persona.SegundoNombre || "",
      primerApellido: persona.PrimerApellido || "",
      segundoApellido: persona.SegundoApellido || "",
      generoId: persona.GeneroId || "",
      tipoDocumentoId: persona.TipoDocumentoId || "",
      numeroDocumento: persona.NumeroDocumento || "",
      nacionalidadId: persona.NacionalidadId || "",
      carreraId: persona.CarreraId || "",
      idEstado: persona.IdEstado || ""
    });
    setModoEdicion(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // Enviar formulario (insertar o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos mínimos (por ejemplo primerNombre, primerApellido, idEstado)
    if (!form.primerNombre.trim() || !form.primerApellido.trim() || !form.idEstado) {
      setErrorMsg("Primer nombre, primer apellido e estado son obligatorios");
      return;
    }

    let res;
    if (modoEdicion) {
      res = await personasService.actualizarPersona(form);
    } else {
      res = await personasService.insertarPersona(form);
    }

    if (res.success) {
      setSuccessMsg(res.message);
      resetForm();
      cargarPersonas();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>{modoEdicion ? "Editar Persona" : "Registrar Nueva Persona"}</h2>

      {errorMsg && (
        <div style={{ color: "red", marginBottom: 10 }}>
          <strong>Error:</strong> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ color: "green", marginBottom: 10 }}>
          <strong>Éxito:</strong> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
          <input
            type="text"
            name="primerNombre"
            placeholder="Primer Nombre *"
            value={form.primerNombre}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="segundoNombre"
            placeholder="Segundo Nombre"
            value={form.segundoNombre}
            onChange={handleChange}
          />
          <input
            type="text"
            name="primerApellido"
            placeholder="Primer Apellido *"
            value={form.primerApellido}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="segundoApellido"
            placeholder="Segundo Apellido"
            value={form.segundoApellido}
            onChange={handleChange}
          />
          <input
            type="number"
            name="generoId"
            placeholder="Género Id"
            value={form.generoId}
            onChange={handleChange}
            min={0}
          />
          <input
            type="number"
            name="tipoDocumentoId"
            placeholder="Tipo Documento Id"
            value={form.tipoDocumentoId}
            onChange={handleChange}
            min={0}
          />
          <input
            type="text"
            name="numeroDocumento"
            placeholder="Número Documento"
            value={form.numeroDocumento}
            onChange={handleChange}
          />
          <input
            type="number"
            name="nacionalidadId"
            placeholder="Nacionalidad Id"
            value={form.nacionalidadId}
            onChange={handleChange}
            min={0}
          />
          <input
            type="number"
            name="carreraId"
            placeholder="Carrera Id"
            value={form.carreraId}
            onChange={handleChange}
            min={0}
          />
          <input
            type="number"
            name="idEstado"
            placeholder="Estado Id *"
            value={form.idEstado}
            onChange={handleChange}
            required
            min={1}
          />
        </div>

        <div style={{ marginTop: 15 }}>
          <button type="submit" style={{ marginRight: 10 }}>
            {modoEdicion ? "Actualizar" : "Registrar"}
          </button>
          <button type="button" onClick={resetForm}>
            Limpiar
          </button>
        </div>
      </form>

      <h2>Lista de Personas</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : errorMsg ? (
        <p style={{ color: "red" }}>{errorMsg}</p>
      ) : personas.length === 0 ? (
        <p>No hay personas registradas.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Primer Nombre</th>
              <th>Segundo Nombre</th>
              <th>Primer Apellido</th>
              <th>Segundo Apellido</th>
              <th>Género Id</th>
              <th>Tipo Documento Id</th>
              <th>Número Documento</th>
              <th>Nacionalidad Id</th>
              <th>Carrera Id</th>
              <th>Estado Id</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personas.map((p) => (
              <tr key={p.IdPersona}>
                <td>{p.IdPersona}</td>
                <td>{p.PrimerNombre}</td>
                <td>{p.SegundoNombre}</td>
                <td>{p.PrimerApellido}</td>
                <td>{p.SegundoApellido}</td>
                <td>{p.GeneroId}</td>
                <td>{p.TipoDocumentoId}</td>
                <td>{p.NumeroDocumento}</td>
                <td>{p.NacionalidadId}</td>
                <td>{p.CarreraId}</td>
                <td>{p.IdEstado}</td>
                <td>
                  <button onClick={() => cargarParaEditar(p)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FrmPersonas;
