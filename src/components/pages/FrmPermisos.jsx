import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import permisoService from "../../services/Permiso";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
const FrmPermisos = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [permisos, setPermisos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idPermiso: null,
    nombrePermiso: "",
    activo: "true",
  });

  useEffect(() => {
    cargarPermisos();
  }, []);

  useEffect(() => {
    setPaginaActual(1); // Reiniciar página al cambiar filas o búsqueda
  }, [filasPorPagina, busqueda]);

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

  const cargarPermisos = async () => {
    setLoading(true);
    try {
      const res = await permisoService.listarPermisos();
      if (res?.resultado) {
        const adaptados = res.resultado.map((p) => ({
          idPermiso: p.idPermiso,
          nombrePermiso: p.nombrePermiso,
          creador: p.creador,
          modificador: p.modificador,
          activo: p.activo,
          fechaCreacion: formatearFecha(p.fechaCreacion),
          fechaModificacion: formatearFecha(p.fechaModificacion),
        }));
        setPermisos(adaptados);
      } else {
        setPermisos([]);
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const abrirNuevo = () => {
    setForm({ idPermiso: null, nombrePermiso: "", activo: "true" });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (permiso) => {
    setForm({
      idPermiso: permiso.idPermiso,
      nombrePermiso: permiso.nombrePermiso,
      activo: permiso.activo.toString(),
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setFormError("");
  };

  const handleGuardar = async () => {
    if (!form.nombrePermiso.trim()) {
      return setFormError("El nombre del permiso es obligatorio.");
    }

    try {
      setFormLoading(true);
      const permisoData = {
        idPermiso: form.idPermiso,
        nombrePermiso: form.nombrePermiso.trim(),
        activo: form.activo === "true",
      };

      let res;
      if (modoEdicion) {
        res = await permisoService.actualizarPermiso(permisoData);
      } else {
        res = await permisoService.insertarPermiso(permisoData);
      }

      if (res?.success || res?.mensaje?.toLowerCase().includes("correctamente")) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          res.mensaje || "Operación exitosa",
          "success"
        );
        cargarPermisos();
      } else {
        cerrarModal();
        await Swal.fire("Error", res?.mensaje || "Error desconocido", "error");
        setFormLoading(false);
      }
    } catch (err) {
      cerrarModal();
      await Swal.fire("Error", err.message || "Hubo un problema al guardar el permiso", "error");
    }
  };

  // Filtrar permisos con búsqueda
  const permisosFiltrados = permisos.filter((p) =>
    p.nombrePermiso.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Paginación:
  const totalPaginas = Math.ceil(permisosFiltrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const permisosPaginados = permisosFiltrados.slice(indexPrimera, indexUltima);

  const columnas = [
    { key: "nombrePermiso", label: "Nombre" },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
    
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
    {
      key: "activo",
      label: "Estado",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
           
          </span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
           
          </span>
        ),
    }
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
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left">
          Gestión de Permisos
        </h2>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <BuscadorBase
            placeholder="Buscar permisos..."
            valor={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            modoOscuro={modoOscuro}
          />
        </div>

        <ContadoresBase
          activos={permisos.filter((p) => p.activo).length}
          inactivos={permisos.filter((p) => !p.activo).length}
          total={permisos.length}
          onNuevo={abrirNuevo}
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
          datos={permisosPaginados}
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
            titulo="Permiso"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombrePermiso"
                placeholder="Nombre del permiso"
                value={form.nombrePermiso}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                autoFocus
              />

              <select
                name="activo"
                value={form.activo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
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

export default FrmPermisos;
