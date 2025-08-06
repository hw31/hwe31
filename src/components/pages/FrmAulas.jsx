import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import aulaService from "../../services/Aulas";
import estadoService from "../../services/Estado";
import catalogoService from "../../services/Catalogos";
import { useSelector } from "react-redux";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const ID_TIPO_CATALOGO_AULA = 5;

const FrmAulas = () => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const { idUsuario } = useSelector((state) => state.auth.usuario);

  const [aulas, setAulas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tiposAula, setTiposAula] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    idAula: 0,
    nombreAula: "",
    capacidad: 0,
    tipoAula: 0, // <- Cambiado aquí a tipoAula
    idEstado: 1,
  });

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

  const obtenerAulas = async () => {
    try {
      const res = await aulaService.listarAula();
      if (res.success && Array.isArray(res.data)) {
        setAulas(res.data);
      } else {
        throw new Error("No se pudo cargar aulas");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar las aulas", "error");
    }
  };

  const obtenerEstados = async () => {
    try {
      const response = await estadoService.listarEstados();
      const data = Array.isArray(response)
        ? response
        : response.datos || response.data || [];

      const filtrados = data
        .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
        .map((e) => ({
          idEstado: e.iD_Estado,
          nombreEstado: e.nombre_Estado,
        }));

      setEstados(filtrados);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los estados", "error");
    }
  };

   const obtenerTiposAula = async () => {
  try {
    const res = await catalogoService.filtrarPorTipoCatalogo(ID_TIPO_CATALOGO_AULA);
    if (res.numero === 0 && Array.isArray(res.resultado)) {
      setTiposAula(res.resultado);
    } else {
      throw new Error("No se pudo cargar tipos de aula");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudieron cargar los tipos de aula", "error");
  }
};

  useEffect(() => {
    obtenerAulas();
    obtenerEstados();
    obtenerTiposAula();
  }, []);

  // Filtrado simple por nombreAula
  const aulasFiltradas = aulas.filter((a) =>
    a.nombreAula?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const total = aulas.length;
  const activos = aulas.filter((a) => a.idEstado === 1).length;
  const inactivos = aulas.filter((a) => a.idEstado === 2).length;

  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = aulasFiltradas.slice(indexPrimera, indexUltima);
  const totalPaginas = Math.ceil(aulasFiltradas.length / filasPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormData({
      idAula: 0,
      nombreAula: "",
      capacidad: 0,
      tipoAula: tiposAula.length > 0 ? tiposAula[0].idCatalogo : 0, // <- aquí también
      idEstado: 1,
    });
    setModalOpen(true);
  };

  const abrirModalEditar = (aula) => {
    setModoEdicion(true);
    setFormData({
      idAula: aula.idAula,
      nombreAula: aula.nombreAula,
      capacidad: aula.capacidad || 0,
      tipoAula: aula.tipoAula || aula.id_TipoAula || 0, // intenta ambas propiedades
      idEstado: aula.idEstado,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((old) => ({
      ...old,
      [name]:
        name === "idEstado" || name === "tipoAula" || name === "capacidad"
          ? Number(value)
          : value,
    }));
  };

  const handleGuardar = async () => {
    if (!formData.nombreAula.trim()) {
      await Swal.fire("Error", "El nombre del aula es obligatorio", "error");
      return;
    }
    if (formData.capacidad < 0) {
      await Swal.fire("Error", "La capacidad no puede ser negativa", "error");
      return;
    }
    if (formData.tipoAula === 0) {
      await Swal.fire("Error", "Debe seleccionar un tipo de aula", "error");
      return;
    }

    setFormLoading(true);

    const payload = {
      idAula: modoEdicion ? formData.idAula : undefined,
      nombreAula: formData.nombreAula.trim(),
      capacidad: formData.capacidad,
      tipoAula: formData.tipoAula, // <- aquí es importante
      idEstado: formData.idEstado,
      idCreador: modoEdicion ? undefined : idUsuario,
      idModificador: modoEdicion ? idUsuario : undefined,
    };

    try {
      const response = modoEdicion
        ? await aulaService.actualizarAula(payload)
        : await aulaService.insertarAula(payload);

      if (response?.numero === -1) {
        cerrarModal();
        await Swal.fire("Error", response.mensaje, "error");
      } else {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Registrado",
          `Aula ${modoEdicion ? "actualizada" : "registrada"} correctamente`,
          "success"
        );
        obtenerAulas();
      }
    } catch (error) {
      console.error(error);
      const mensaje =
        error.response?.data?.mensaje || error.message || "Error al guardar";
      cerrarModal();
      await Swal.fire("Error", mensaje, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const renderEstadoIcono = (idEstado) => {
    if (idEstado === 1)
      return <FaCheckCircle className="text-green-500 text-xl mx-auto" />;
    if (idEstado === 2)
      return <FaTimesCircle className="text-red-500 text-xl mx-auto" />;
    return null;
  };

  return (
    <>
   <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
        Aulas
          </h2>
        </div>

        <BuscadorBase
          placeholder="Buscar aula por nombre..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
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
            No hay aulas para mostrar.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto w-full mt-4">
              <div className="min-w-[700px]">
                <TablaBase
                  datos={datosPaginados}
                  columnas={[
                    { key: "nombreAula", label: "Nombre" },
                    { key: "capacidad", label: "Capacidad" },
                    {
                      key: "tipoAula",
                      label: "Tipo",
                      render: (item) => {
                        const tipo = tiposAula.find(
                          (t) => t.idCatalogo === item.id_TipoAula
                        );
                        return tipo ? tipo.descripcionCatalogo : "-";
                      },
                    },
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
                          aria-label={`Editar aula ${item.nombreAula}`}
                          type="button"
                        >
                          <FaEdit />
                        </button>
                      ),
                    },
                  ]}
                  modoOscuro={modoOscuro}
                />
              </div>
            </div>

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
          </>
        )}

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            titulo={modoEdicion ? "Editar Aula" : "Nueva Aula"}
            modoEdicion={modoEdicion}
            onCancel={cerrarModal}
            onSubmit={handleGuardar}
            modoOscuro={modoOscuro}
            loading={formLoading}
          >
            <label className="block mb-2 font-semibold" htmlFor="nombreAula">
              Nombre del aula:
              <input
                id="nombreAula"
                name="nombreAula"
                type="text"
                value={formData.nombreAula}
                onChange={handleChange}
                className={`${inputClass} mt-1 mb-4`}
                required
                autoFocus
              />
            </label>

            <label className="block mb-2 font-semibold" htmlFor="capacidad">
              Capacidad:
              <input
                id="capacidad"
                name="capacidad"
                type="number"
                min={0}
                value={formData.capacidad}
                onChange={handleChange}
                className={`${inputClass} mt-1 mb-4`}
                required
              />
            </label>

            <label className="block mb-2 font-semibold" htmlFor="tipoAula">
              Tipo de aula:
              <select
                id="tipoAula"
                name="tipoAula"
                value={formData.tipoAula}
                onChange={handleChange}
                className={`${inputClass} mt-1 mb-4`}
                required
              >
                {tiposAula.length === 0 ? (
                  <option value={0}>Cargando tipos de aula...</option>
                ) : (
                  tiposAula.map((t) => (
                    <option key={t.idCatalogo} value={t.idCatalogo}>
                      {t.descripcionCatalogo}
                    </option>
                  ))
                )}
              </select>
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
 </>
  );
};

export default FrmAulas;
