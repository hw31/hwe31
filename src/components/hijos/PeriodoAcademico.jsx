import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import periodoService from "../../services/PeriodoAcademico";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const PeriodoAcademico = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-100 text-gray-700";

  const [periodos, setPeriodos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idPeriodoAcademico: 0,
    nombre: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const cargarPeriodos = async () => {
    try {
      setLoading(true);
      const res = await periodoService.listarPeriodosAcademicos();

      if (Array.isArray(res.resultado)) {
        setPeriodos(
          res.resultado.map((p) => ({
            idPeriodoAcademico: p.idPeriodoAcademico,
            nombre: p.nombrePeriodo,
            estado: p.activo ? "Activo" : "Inactivo",
            activo: p.activo,
            fechaInicio: p.fechaInicio,
            fechaFin: p.fechaFin,
            fechaInicioFormateada: formatearFecha(p.fechaInicio),
            fechaFinFormateada: formatearFecha(p.fechaFin),
          }))
        );
      } else {
        setPeriodos([]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los periodos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPeriodos();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const abrirModalNuevo = () => {
    setForm({
      idPeriodoAcademico: 0,
      nombre: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (item) => {
    setForm({
      idPeriodoAcademico: item.idPeriodoAcademico,
      nombre: item.nombre,
      estado: item.estado,
      fechaInicio: item.fechaInicio?.split("T")[0] || "",
      fechaFin: item.fechaFin?.split("T")[0] || "",
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.nombre.trim()) return setFormError("El nombre es obligatorio");
    if (!form.estado) return setFormError("Seleccione un estado");
    if (!form.fechaInicio || !form.fechaFin)
      return setFormError("Debe seleccionar fechas de inicio y fin");
    if (form.fechaFin < form.fechaInicio)
      return setFormError("La fecha de fin no puede ser menor que la de inicio");

    try {
      setFormLoading(true);

      const datos = {
        idPeriodoAcademico: form.idPeriodoAcademico,
        nombrePeriodo: form.nombre.trim(),
        activo: form.estado === "Activo",
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      };

      const res = modoEdicion
        ? await periodoService.actualizarPeriodoAcademico(datos)
        : await periodoService.insertarPeriodoAcademico(datos);

      if (res.numero && res.numero > 0) {
        cerrarModal();
        await Swal.fire(
          modoEdicion ? "Actualizado" : "Agregado",
          res.mensaje || `Periodo ${modoEdicion ? "actualizado" : "insertado"} correctamente`,
          "success"
        );
        cargarPeriodos();
      } else {
        cerrarModal();
        await Swal.fire("Error", res.mensaje || "Error desconocido", "error");
      }
    } catch (error) {
      cerrarModal();
      const mensajeError =
        error.response?.data?.mensaje || error.message || "Hubo un error";
      await Swal.fire("Error", mensajeError, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Filtrar periodos según texto de búsqueda
  const datosFiltrados = periodos.filter((p) => {
    const texto = busqueda.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(texto) ||
      p.estado.toLowerCase().includes(texto) ||
      p.fechaInicioFormateada.toLowerCase().includes(texto) ||
      p.fechaFinFormateada.toLowerCase().includes(texto)
    );
  });

  // Define columnas para TablaBase
  const columnas = [
    { key: "nombre", label: "Nombre del Periodo", style: { maxWidth: "180px", width: "180px" } },
    { key: "activo", label: "Estado", style: { width: "80px" } },
    { key: "fechaInicioFormateada", label: "Inicio", style: { width: "90px" } },
    { key: "fechaFinFormateada", label: "Fin", style: { width: "90px" } },
  ];

  return (
  <>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
          titulo="Periodo"
        />

        <ContadoresBase
          activos={periodos.filter((p) => p.estado === "Activo").length}
          inactivos={periodos.filter((p) => p.estado === "Inactivo").length}
          total={periodos.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        {/* Contenedor para aplicar estilos solo a esta tabla */}
        <div className="periodos-table-container">
          <style>{`
            .periodos-table-container table th,
            .periodos-table-container table td {
              padding-left: 6px !important;
              padding-right: 6px !important;
              white-space: nowrap;
            }
            .periodos-table-container table th:nth-child(1),
            .periodos-table-container table td:nth-child(1) {
              max-width: 80px;
              width: 50px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .periodos-table-container table th:nth-child(2),
            .periodos-table-container table td:nth-child(2) {
              width: 80px;
              max-width: 80px;
              text-align: center;
            }
            .periodos-table-container table th:nth-child(3),
            .periodos-table-container table td:nth-child(3),
            .periodos-table-container table th:nth-child(4),
            .periodos-table-container table td:nth-child(4) {
              width: 90px;
              max-width: 90px;
              text-align: center;
            }
          `}</style>

          <TablaBase
            datos={datosFiltrados}
            columnas={columnas}
            modoOscuro={modoOscuro}
            onEditar={handleEditar}
            loading={loading}
            texto={texto}
            encabezadoClase={encabezado}
          />
        </div>

        <ModalBase
          isOpen={modalOpen}
          onClose={cerrarModal}
          titulo={modoEdicion ? "Editar Periodo" : "Nuevo Periodo"}
          modoOscuro={modoOscuro}
        >
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Periodo Académico"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del periodo"
                value={form.nombre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                autoFocus
              />
              <select
                name="estado"
                value={form.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Seleccione estado</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              <input
                type="date"
                name="fechaInicio"
                value={form.fechaInicio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <input
                type="date"
                name="fechaFin"
                value={form.fechaFin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </FormularioBase>
        </ModalBase>
</>
  );
};

export default PeriodoAcademico;
