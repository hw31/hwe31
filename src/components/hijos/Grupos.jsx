import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import grupoService from "../../services/Grupos";
import estadoService from "../../services/Estado";
import { useSelector } from "react-redux";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const Grupos = () => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const { idUsuario } = useSelector((state) => state.auth.usuario);
  const rolLower = useSelector((state) => state.auth?.rol?.toLowerCase()) || "";
  const esAdministrador = rolLower === "administrador";

  const [grupos, setGrupos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    idcodigoGrupo: 0,
    codigoGrupo: "",
    idEstado: 1,
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const inputClass =
    "w-full px-3 py-2 border rounded focus:outline-none " +
    (modoOscuro
      ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600");

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

  const obtenerGrupos = async () => {
    try {
      const data = await grupoService.listarGrupos();
      const gruposMapeados = data.map((g) => ({
        idGrupo: g.idGrupo ?? g.iD_Grupo ?? g.idcodigoGrupo,
        codigoGrupo: g.codigoGrupo ?? g.codigo_Grupo ?? "",
        idEstado: g.idEstado ?? g.iD_Estado ?? 1,
        creador: g.creador ?? "N/D",
        modificador: g.modificador ?? "N/D",
        fechaCreacion: g.fechaCreacion ?? g.fecha_Creacion ?? "",
        fechaModificacion: g.fechaModificacion ?? g.fecha_Modificacion ?? "",
      }));
      setGrupos(gruposMapeados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los grupos", "error");
    }
  };

  const obtenerEstados = async () => {
    try {
      const response = await estadoService.listarEstados();
      const data = Array.isArray(response)
        ? response
        : response.datos
        ? response.datos
        : response.data
        ? response.data
        : [];

      const filtrados = data
        .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
        .map((e) => ({
          idEstado: e.iD_Estado,
          nombreEstado: e.nombre_Estado,
        }));

      setEstados(filtrados);
      return filtrados;
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los estados", "error");
      return [];
    }
  };

  useEffect(() => {
    obtenerGrupos();
    obtenerEstados();
  }, []);

  const gruposFiltrados = grupos.filter((g) =>
    g.codigoGrupo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const total = grupos.length;
  const activos = grupos.filter((g) => g.idEstado === 1).length;
  const inactivos = grupos.filter((g) => g.idEstado === 2).length;

  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados = gruposFiltrados.slice(indexPrimeraFila, indexUltimaFila);
  const totalPaginas = Math.ceil(gruposFiltrados.length / filasPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormData({ idcodigoGrupo: 0, codigoGrupo: "", idEstado: 1 });
    setModalOpen(true);
  };

  const abrirModalEditar = (grupo) => {
    setModoEdicion(true);
    setFormData({
      idcodigoGrupo: grupo.idGrupo,
      codigoGrupo: grupo.codigoGrupo,
      idEstado: grupo.idEstado,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "idEstado" ? Number(value) : value,
    });
  };

  const handleGuardar = async () => {
    if (!formData.codigoGrupo.trim()) {
      await Swal.fire("Error", "El código del grupo es obligatorio", "error");
      return;
    }
    setFormLoading(true);

    let payload;
    if (modoEdicion) {
      payload = {
        idcodigoGrupo: formData.idcodigoGrupo,
        codigoGrupo: formData.codigoGrupo.trim(),
        idEstado: Number(formData.idEstado),
      };
    } else {
      payload = {
        codigoGrupo: formData.codigoGrupo.trim(),
        idEstado: Number(formData.idEstado),
      };
    }

    try {
      if (modoEdicion) {
        const res = await grupoService.actualizarGrupo(payload);

        if (res?.numero === -1) {
          cerrarModal();
          await Swal.fire("Error", res.mensaje, "error");
          return;
        } else {
          cerrarModal();
          await Swal.fire("Actualizado", "Grupo actualizado correctamente", "success");
          obtenerGrupos();
        }
      } else {
        const res = await grupoService.insertarGrupos(payload);

        if (res?.numero === -1) {
          cerrarModal();
          await Swal.fire("Error", res.mensaje, "error");
          return;
        } else {
          cerrarModal();
          await Swal.fire("Registrado", "Grupo registrado correctamente", "success");
          obtenerGrupos();
        }
      }
    } catch (error) {
      console.error(error);
      let mensajeError = "No se pudo guardar el grupo";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.mensaje) mensajeError = data.mensaje;
        else if (typeof data === "string") mensajeError = data;
      } else if (error.message) {
        mensajeError = error.message;
      }
      cerrarModal();
      await Swal.fire("Error", mensajeError, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const renderEstadoIcono = (idEstado) => {
    if (idEstado === 1)
      return (
        <FaCheckCircle
          title="Activo"
          aria-label="Activo"
          className="text-green-500 text-xl mx-auto"
        />
      );
    if (idEstado === 2)
      return (
        <FaTimesCircle
          title="Inactivo"
          aria-label="Inactivo"
          className="text-red-500 text-xl mx-auto"
        />
      );
    return null;
  };

  const columnasBase = [
  { key: "codigoGrupo", label: "Código" },
  {
    key: "idEstado",
    label: "Estado",
    render: (item) => renderEstadoIcono(item.idEstado),
  },
  {
    key: "acciones",
    label: "Acciones",
    render: (item) => (
      <button
        onClick={() => abrirModalEditar(item)}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white transition-colors"
        aria-label={`Editar grupo ${item.codigoGrupo}`}
        type="button"
      >
        <FaEdit />
      </button>
    ),
  },
];

const columnasAdmin = [
  { key: "creador", label: "Creador" },
  { key: "modificador", label: "Modificador" },
  {
    key: "fechaCreacion",
    label: "Creación",
    render: (item) => formatearFecha(item.fechaCreacion),
  },
  {
    key: "fechaModificacion",
    label: "Modificación",
    render: (item) => formatearFecha(item.fechaModificacion),
  },
];

const columnasTabla = esAdministrador
  ? [columnasBase[0], ...columnasAdmin, columnasBase[1], columnasBase[2]]
  : columnasBase;

  return (
    <>
  <div style={{ overflowX: "hidden", width: "100%" }}>
    <BuscadorBase
      placeholder="Buscar..."
      valor={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
      modoOscuro={modoOscuro}
      titulo="Grupos"
    />

    <ContadoresBase
      activos={activos}
      inactivos={inactivos}
      total={total}
      onNuevo={abrirModalNuevo}
      modoOscuro={modoOscuro}
    />

    <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
      <label htmlFor="filasPorPagina" className="font-semibold">
        Filas por página:
      </label>
      <select
        id="filasPorPagina"
        value={filasPorPagina}
        onChange={(e) => setFilasPorPagina(parseInt(e.target.value))}
        className={inputClass + " text-sm py-1 px-2"}
        style={{ maxWidth: "5rem" }}
      >
        {[10, 30, 45, 60, 100].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>

    {datosPaginados.length === 0 ? (
      <p
        className={`text-center italic ${
          modoOscuro ? "text-blue-300" : "text-gray-500"
        }`}
      >
        No hay grupos para mostrar.
      </p>
    ) : (
      <>
        {/* Contenedor con scroll horizontal solo para la tabla */}
        <div className="overflow-x-auto w-full mt-4">
          {/* para evitar scroll innecesario */}
          <div className="min-w-full sm:min-w-[700px]">
            <TablaBase
              datos={datosPaginados}
              columnas={columnasTabla}
              modoOscuro={modoOscuro}
            />
          </div>
        </div>

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
            aria-label="Página anterior"
            type="button"
          >
            Anterior
          </button>
          <span className="font-semibold">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() =>
              setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))
            }
            className={`rounded px-4 py-2 text-white ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
            aria-label="Página siguiente"
            type="button"
          >
            Siguiente
          </button>
        </div>
      </>
    )}

    <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
      <FormularioBase
        titulo={modoEdicion ? "Editar Grupo" : "Nuevo Grupo"}
        modoEdicion={modoEdicion}
        onCancel={cerrarModal}
        onSubmit={handleGuardar}
        modoOscuro={modoOscuro}
        loading={formLoading}
      >
        <label className="block mb-2 font-semibold" htmlFor="codigoGrupo">
          Código del grupo:
          <input
            id="codigoGrupo"
            type="text"
            name="codigoGrupo"
            value={formData.codigoGrupo}
            onChange={handleChange}
            className={`${inputClass} mt-1 mb-4`}
            required
            autoFocus
            aria-label="Código del grupo"
          />
        </label>

        <label className="block mb-4 font-semibold" htmlFor="idEstado">
          Estado:
          <select
            id="idEstado"
            name="idEstado"
            value={formData.idEstado}
            onChange={handleChange}
            className={`${inputClass} mt-1`}
            required
            aria-label="Estado del grupo"
          >
            {estados.length === 0 ? (
              <option value="">Cargando estados...</option>
            ) : (
              estados.map((e) => (
                <option key={e.idEstado} value={e.idEstado}>
                  {e.nombreEstado}
                </option>
              ))
            )}
          </select>
        </label>
      </FormularioBase>
    </ModalBase>
  </div>


 </>

  );
};

export default Grupos;
