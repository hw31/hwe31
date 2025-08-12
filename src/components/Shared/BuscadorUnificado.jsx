// src/components/BuscadorUnificado.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import BuscadorBase from "../Shared/BuscadorBase";

import personaService from "../../services/personaService";
import direccionService from "../../services/direccionService";
import usuarioService from "../../services/usuarioService";
import FrmContacto from "../hijos/FrmContacto";

const BuscadorUnificado = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [personas, setPersonas] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Control de visibilidad resultados
  const [mostrarContactos, setMostrarContactos] = useState(true);

  // Debounce simple para evitar filtrar en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusquedaDebounced(busqueda);
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      setError(null);
      try {
        const [p, d, u] = await Promise.all([
          personaService.getAll(),
          direccionService.getAll(),
          usuarioService.getAll(),
        ]);
        setPersonas(p);
        setDirecciones(d);
        setUsuarios(u);
      } catch (e) {
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  // Función de filtro genérica
  const filtro = (lista, keys) => {
    if (!busquedaDebounced) return lista;
    const texto = busquedaDebounced.toLowerCase();
    return lista.filter((item) =>
      keys.some((key) => String(item[key]).toLowerCase().includes(texto))
    );
  };

  const personasFiltradas = filtro(personas, ["nombre", "apellido", "email"]);
  const direccionesFiltradas = filtro(direcciones, ["direccion", "ciudad"]);
  const usuariosFiltrados = filtro(usuarios, ["username", "email", "nombreCompleto"]);

  const hayResultados =
    personasFiltradas.length > 0 ||
    direccionesFiltradas.length > 0 ||
    usuariosFiltrados.length > 0 ||
    mostrarContactos;

  // Callback que recibe FrmContacto para indicar si tiene resultados visibles
  const onContactosResultados = (hay) => {
    setMostrarContactos(hay);
  };

  if (loading)
    return <p className="text-center p-6">Cargando datos...</p>;
  if (error)
    return <p className="text-center p-6 text-red-600">{error}</p>;

  return (
    <div
      className={`p-6 max-w-4xl mx-auto rounded-xl ${
        modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <BuscadorBase
        placeholder="Buscar en todo..."
        valor={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        modoOscuro={modoOscuro}
      />

      <div className="mt-6 space-y-8">
        {hayResultados ? (
          <>
            {personasFiltradas.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  Personas ({personasFiltradas.length})
                </h2>
                {personasFiltradas.map((p) => (
                  <div key={p.id} className="border p-2 rounded mb-1">
                    {p.nombre} {p.apellido} - {p.email}
                  </div>
                ))}
              </section>
            )}

            {direccionesFiltradas.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  Direcciones ({direccionesFiltradas.length})
                </h2>
                {direccionesFiltradas.map((d) => (
                  <div key={d.id} className="border p-2 rounded mb-1">
                    {d.direccion}, {d.ciudad}
                  </div>
                ))}
              </section>
            )}

            {mostrarContactos && (
              <section>
                <h2 className="text-lg font-semibold mb-2">Contactos</h2>
                <FrmContacto busqueda={busquedaDebounced} onResultados={onContactosResultados} />
              </section>
            )}

            {usuariosFiltrados.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-2">
                  Usuarios ({usuariosFiltrados.length})
                </h2>
                {usuariosFiltrados.map((u) => (
                  <div key={u.id} className="border p-2 rounded mb-1">
                    {u.username} - {u.nombreCompleto}
                  </div>
                ))}
              </section>
            )}
          </>
        ) : (
          <p className="text-center italic text-gray-500 mt-8">
            No se encontraron resultados para "{busquedaDebounced}"
          </p>
        )}
      </div>
    </div>
  );
};

export default BuscadorUnificado;
