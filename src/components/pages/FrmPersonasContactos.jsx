import React, { useEffect, useState } from "react";
import PersonasService from "../../services/Persona"; // tu servicio
import ContadoresBase from "../Shared/ContadoresBase";
import ModalBase from "../Shared/ModalBase";

const FormularioPersona = ({ registro, onCerrar }) => {
  const [form, setForm] = useState({
    id: registro?.id || "",
    nombre: registro?.nombre || "",
    apellido: registro?.apellido || "",
    // agrega aquí los campos que necesites
  });
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      if (form.id) {
        await PersonasService.actualizarPersona(form);
      } else {
        await PersonasService.insertarPersona(form);
      }
      onCerrar(true); // indicamos que hubo cambios
    } catch (error) {
      alert("Error al guardar persona");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ModalBase onCerrar={() => onCerrar(false)} titulo={form.id ? "Editar Persona" : "Agregar Persona"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
      >
        <div className="mb-2">
          <label className="block font-semibold">Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-1"
            required
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Apellido</label>
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-1"
            required
          />
        </div>

        {/* Agrega más campos según tu modelo */}

        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={() => onCerrar(false)}
            className="mr-2 btn btn-secondary"
            disabled={guardando}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

const Personas = ({ busqueda }) => {
  const [datos, setDatos] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);

  // Cargar datos
  const cargarDatos = async () => {
    setLoading(true);
    const res = await PersonasService.listarPersonas();
    if (res.success) {
      setDatos(res.data);
    } else {
      setDatos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar datos con busqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setDatosFiltrados(datos);
      return;
    }
    const filtro = busqueda.toLowerCase();
    setDatosFiltrados(
      datos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(filtro) ||
          p.apellido.toLowerCase().includes(filtro)
      )
    );
  }, [busqueda, datos]);

  // Abrir modal (nuevo o editar)
  const abrirModal = (registro = null) => {
    setRegistroEditar(registro);
    setModalAbierto(true);
  };

  // Cerrar modal y recargar si hay cambio
  const cerrarModal = (actualizo) => {
    setModalAbierto(false);
    setRegistroEditar(null);
    if (actualizo) cargarDatos();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold">Personas</h3>
        <button
          className="btn btn-primary"
          onClick={() => abrirModal(null)}
        >
          Agregar
        </button>
      </div>

      <ContadoresBase total={datos.length} filtrados={datosFiltrados.length} />

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1">ID</th>
              <th className="border border-gray-300 px-2 py-1">Nombre</th>
              <th className="border border-gray-300 px-2 py-1">Apellido</th>
              <th className="border border-gray-300 px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.map((persona) => (
              <tr key={persona.id}>
                <td className="border border-gray-300 px-2 py-1">{persona.id}</td>
                <td className="border border-gray-300 px-2 py-1">{persona.nombre}</td>
                <td className="border border-gray-300 px-2 py-1">{persona.apellido}</td>
                <td className="border border-gray-300 px-2 py-1">
                  <button
                    className="btn btn-secondary"
                    onClick={() => abrirModal(persona)}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
            {datosFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-2">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalAbierto && (
        <FormularioPersona registro={registroEditar} onCerrar={cerrarModal} />
      )}
    </div>
  );
};

export default Personas;
