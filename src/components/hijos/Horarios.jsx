import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import horariosService from "../../services/Horarios";
import usuarioService from "../../services/Usuario";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Horarios = () => {
  const { modoOscuro } = useSelector((state) => state.theme);
  const { idUsuario } = useSelector((state) => state.auth.usuario);

  const [horarios, setHorarios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [form, setForm] = useState({
    idHorario: 0,
    diaSemana: 1,
    horaInicio: "",
    horaFin: "",
    idEstado: 1,
  });

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800";

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

  const getNombreUsuario = (id) => {
    const user = usuarios.find((u) => u.id_Usuario === id);
    return user?.usuario?.trim() || "ND";
  };

  const cargarDatos = async () => {
    try {
      const [resHorarios, resUsuarios] = await Promise.all([
        horariosService.listarHorarios(),
        usuarioService.listarUsuario(),
      ]);
      setHorarios(resHorarios || []);
      setUsuarios(resUsuarios.data || []);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const datosFiltrados = horarios.filter(
    (h) =>
      h.nombreDiaSemana?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.horaInicio.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.horaFin.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexUltimaFila = paginaActual * filasPorPagina;
  const indexPrimeraFila = indexUltimaFila - filasPorPagina;
  const datosPaginados = datosFiltrados.slice(indexPrimeraFila, indexUltimaFila);
  const totalPaginas = Math.ceil(datosFiltrados.length / filasPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filasPorPagina]);

  const handleEditar = (item) => {
    setForm({
      idHorario: item.idHorario,
      diaSemana: item.diaSemana,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
      idEstado: item.idEstado,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const abrirModalNuevo = () => {
    setForm({
      idHorario: 0,
      diaSemana: 1,
      horaInicio: "",
      horaFin: "",
      idEstado: 1,
    });
    setModoEdicion(false);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    if (!form.horaInicio || !form.horaFin) {
      Swal.fire("Error", "Todos los campos son obligatorios", "warning");
      return;
    }

    try {
      const payload = {
        ...form,
        diaSemana: parseInt(form.diaSemana),
        idEstado: parseInt(form.idEstado),
        id_Creador: modoEdicion ? undefined : idUsuario,
        fecha_Creacion: modoEdicion ? undefined : new Date(),
        id_Modificador: modoEdicion ? idUsuario : undefined,
        fecha_Modificacion: modoEdicion ? new Date() : undefined,
      };

      const res = modoEdicion
        ? await horariosService.actualizarHoraios(payload)
        : await horariosService.insertarHorarios(payload);

      if (res.success || res.numero > 0) {
        Swal.fire("Éxito", modoEdicion ? "Horario actualizado" : "Horario registrado", "success");
        setModalOpen(false);
        cargarDatos();
      } else {
        throw new Error(res.mensaje || "Error desconocido");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  return (

<>
        <div className="flex justify-between items-center mb-4">
        
        </div>
        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
          titulo="Horarios"
        />

        <ContadoresBase
          activos={horarios.filter((h) => h.idEstado === 1).length}
          inactivos={horarios.filter((h) => h.idEstado === 2).length}
          total={horarios.length}
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

        <div className="overflow-x-auto w-full mt-4">
            <div className="min-w-full sm:min-w-[700px]">
            <TablaBase
              datos={datosPaginados}
              columnas={[
                { key: "nombreDiaSemana", label: "Día" },
                { key: "horaInicio", label: "Hora Inicio" },
                { key: "horaFin", label: "Hora Fin" },
                {
                  key: "creador",
                  label: "Creador",
                  render: (item) => getNombreUsuario(item.idCreador),
                },
                {
                  key: "modificador",
                  label: "Modificador",
                  render: (item) => getNombreUsuario(item.idModificador),
                },
                {
                  key: "fechaCreacion",
                  label: "Fecha Creación",
                  render: (item) => formatearFecha(item.fechaCreacion),
                },
                {
                  key: "fechaModificacion",
                  label: "Fecha Modificación",
                  render: (item) => formatearFecha(item.fechaModificacion),
                },
                {
                  key: "estado",
                  label: "Estado",
                  render: (item) =>
                    item.idEstado === 1 ? (
                      <FaCheckCircle className="text-green-500 text-xl mx-auto" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-xl mx-auto" />
                    ),
                },
              ]}
              onEditar={handleEditar}
              modoOscuro={modoOscuro}
              encabezadoClase={encabezado}
              texto={texto}
            />
          </div>
        </div>

        {totalPaginas > 1 && (
  <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
    <button
      disabled={paginaActual === 1}
      onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
      className={`px-4 py-2 rounded transition ${
        paginaActual === 1
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      Anterior
    </button>

    <div className="text-lg font-semibold text-center w-full sm:w-auto">
      Página {paginaActual} de {totalPaginas}
    </div>

    <button
      disabled={paginaActual === totalPaginas || totalPaginas === 0}
      onClick={() => setPaginaActual((p) => Math.min(p + 1, totalPaginas))}
      className={`px-4 py-2 rounded transition ${
        paginaActual === totalPaginas || totalPaginas === 0
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      Siguiente
    </button>
  </div>
)}

        <ModalBase isOpen={modalOpen} onClose={() => setModalOpen(false)} modoOscuro={modoOscuro}>
          <FormularioBase
            titulo="Horario"
            modoEdicion={modoEdicion}
            onCancel={() => setModalOpen(false)}
            onSubmit={handleGuardar}
            modoOscuro={modoOscuro}
          >
            <select
              name="diaSemana"
              value={form.diaSemana}
              onChange={handleInputChange}
              className={`${inputClass} mb-4`}
            >
              {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(
                (dia, i) => (
                  <option key={i + 1} value={i + 1}>
                    {dia}
                  </option>
                )
              )}
            </select>

            <input
              type="time"
              name="horaInicio"
              value={form.horaInicio}
              onChange={handleInputChange}
              className={`${inputClass} mb-4`}
            />

            <input
              type="time"
              name="horaFin"
              value={form.horaFin}
              onChange={handleInputChange}
              className={`${inputClass} mb-4`}
            />

            <select
              name="idEstado"
              value={form.idEstado}
              onChange={handleInputChange}
              className={`${inputClass} mb-4`}
            >
              <option value={1}>Activo</option>
              <option value={2}>Inactivo</option>
            </select>
          </FormularioBase>
        </ModalBase>
</>

  );
};

export default Horarios;
