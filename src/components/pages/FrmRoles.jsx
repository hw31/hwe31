import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import rolService from "../../services/Roles";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
const FrmRoles = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idRol: 0,
    nombre: "",
    descripcion: "",
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const adaptarDatosRoles = (datos) =>
    datos.map((r) => ({
      idRol: r.iD_Rol,
      nombre: r.nombre_Rol,
      descripcion: r.activo ? "Activo" : "Inactivo",
      activo: r.activo,
      fechaCreacion: formatearFecha(r.fecha_Creacion),
      fechaModificacion: formatearFecha(r.fecha_Modificacion),
      nombreCreador: r.nombre_Creador,
      nombreModificador: r.nombre_Modificador,
    }));

  useEffect(() => {
    cargarRoles();
  }, []);

  useEffect(() => {
    setPaginaActual(1); // Reiniciar al cambiar búsqueda o filas
  }, [busqueda, filasPorPagina]);

  const cargarRoles = async () => {
    try {
      setLoading(true);
      const res = await rolService.listarRoles();
      if (res && Array.isArray(res.resultado)) {
        setRoles(adaptarDatosRoles(res.resultado));
      } else {
        setRoles([]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModalNuevo = () => {
    setForm({ idRol: 0, nombre: "", descripcion: "" });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (rol) => {
    setForm({
      idRol: rol.idRol,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.nombre.trim()) return setFormError("El nombre es obligatorio");
    if (!form.descripcion) return setFormError("Seleccione un estado");

    try {
      setFormLoading(true);
      let res;
      if (modoEdicion) {
        res = await rolService.actualizarRol({
          id_Rol: form.idRol,
          nombre_Rol: form.nombre.trim(),
          activo: form.descripcion === "Activo",
        });
      } else {
        res = await rolService.insertarRol({
          nombreRol: form.nombre.trim(),
          activo: form.descripcion === "Activo",
        });
      }

      const exitoso = res.numero > 0 || res.success;

      if (exitoso) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          modoEdicion ? "Rol actualizado correctamente" : "Rol insertado correctamente",
          "success"
        );
        cargarRoles();
      } else {
        cerrarModal();
        await Swal.fire("Error", res.mensaje || "Error desconocido", "error");
        setFormLoading(false);
      }
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Hubo un problema al guardar el rol";
      await Swal.fire("Error", mensajeError, "error");
      setFormLoading(false);
    }
  };

  // Filtrado y paginación
  const datosFiltrados = roles.filter((rol) =>
    rol.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimera, indexUltima);

  const columnas = [
    { key: "nombre", label: "Nombre" },
    { key: "nombreCreador", label: "Creador" },
    { key: "nombreModificador", label: "Modificador" },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    {
      key: "activo",
      label: "Estado",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-2">
            <FaCheckCircle className="text-xl" />
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-2">
            <FaTimesCircle className="text-xl" />
          </span>
        ),
    },
  ];
 const navigate = useNavigate();
  const handleVolver = () => {
    navigate("/dashboard/aulas"); // Ajusta la ruta aquí
  };
  return (
      <>
      <style>{`
        /* Estilos para el botón flotante */
        .btn-volver {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: ${modoOscuro ? "#334155" : "#f3f4f6"};
          color: ${modoOscuro ? "#a5f3fc" : "#2563eb"};
          border: none;
          border-radius: 50%;
          padding: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          z-index: 1000;
        }
        .btn-volver:hover {
          background-color: ${modoOscuro ? "#475569" : "#60a5fa"};
          color: white;
        }
      `}</style>
    <div className="mx-auto max-w-[900px] w-full rounded-2xl p-6">
      <div
        className={`w-full px-4 rounded-2xl shadow-md p-6 ${
          modoOscuro
            ? "bg-gray-900 text-white shadow-gray-700"
            : "bg-white text-gray-900 shadow-gray-300"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">Gestión de Roles</h2>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <BuscadorBase
            placeholder="Buscar roles..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <ContadoresBase
          activos={roles.filter((r) => r.activo).length}
          inactivos={roles.filter((r) => !r.activo).length}
          total={roles.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        <div className="mt-2 mb-4 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
          <label htmlFor="filasPorPagina" className="font-semibold">
            Filas por página:
          </label>
          <select
            id="filasPorPagina"
            value={filasPorPagina}
            onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
            className={`w-[5rem] px-3 py-1 rounded border ${
              modoOscuro
                ? "bg-gray-800 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            }`}
          >
            {[10, 30, 45, 60, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <TablaBase
          datos={datosPaginados}
          columnas={columnas}
          modoOscuro={modoOscuro}
          onEditar={handleEditar}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
        />

        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Anterior
          </button>
          <span className="font-semibold">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() =>
              setPaginaActual((p) =>
                p < totalPaginas ? p + 1 : totalPaginas
              )
            }
            className={`rounded px-4 py-2 text-white ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Siguiente
          </button>
        </div>

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Rol"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del rol"
                value={form.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                autoFocus
              />
              <select
                name="descripcion"
                value={form.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Seleccione estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </FormularioBase>
        </ModalBase>
      </div>
    </div>
     {/* Botón flotante volver */}
                  <button
                    className="btn-volver"
                    onClick={handleVolver}
                    aria-label="Volver"
                    title="Volver"
                  >
                    <ArrowLeftCircle size={24} />
                  </button>
                </>
  );
};

export default FrmRoles;
