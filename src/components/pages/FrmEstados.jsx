import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import estadoService from "../../services/Estado";
import usuarioService from "../../services/Usuario";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmEstados = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [estados, setEstados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    idEstado: 0,
    nombre: "",
    descripcion: "", // Activo / Inactivo
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

  // Adaptar datos uniendo nombres de usuario por ID, manejando null y 0
  const adaptarDatosEstados = (estadosData, usuarios) =>
    estadosData.map((e) => {
      // Validar y obtener creador
      const creador =
        e.iD_Creador && e.iD_Creador !== 0
          ? usuarios.find((u) => u.id_Usuario === e.iD_Creador)
          : null;
      // Validar y obtener modificador
      const modificador =
        e.iD_Modificador && e.iD_Modificador !== 0
          ? usuarios.find((u) => u.id_Usuario === e.iD_Modificador)
          : null;

      return {
        idEstado: e.iD_Estado,
        nombre: e.nombre_Estado,
        activo: e.activo,
        fechaCreacion: formatearFecha(e.fecha_Creacion),
        fechaModificacion: formatearFecha(e.fecha_Modificacion),
        nombreCreador: creador ? creador.persona.trim() : "ND",
        nombreModificador: modificador ? modificador.persona.trim() : "ND",
      };
    });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resEstados, resUsuarios] = await Promise.all([
        estadoService.listarEstados(),
        usuarioService.listarUsuario(),
      ]);

      if (resEstados.success && resUsuarios.success) {
        setEstados(adaptarDatosEstados(resEstados.data, resUsuarios.data));
      } else {
        setEstados([]);
      }
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormError("");
  };

  const abrirModalNuevo = () => {
    setForm({ idEstado: 0, nombre: "", descripcion: "" });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
  };

  const handleEditar = (estado) => {
    setForm({
      idEstado: estado.idEstado,
      nombre: estado.nombre,
      descripcion: estado.activo ? "Activo" : "Inactivo",
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleGuardar = async () => {
  if (!form.nombre.trim()) return setFormError("El nombre es obligatorio");
  if (!form.descripcion) return setFormError("Debe seleccionar un estado");

  try {
    setFormLoading(true);

    const datos = {
      id_Estado: form.idEstado,
      nombre_Estado: form.nombre.trim(),
      activo: form.descripcion === "Activo",
    };

    let res;
    if (modoEdicion) {
      res = await estadoService.actualizarEstado(datos);
    } else {
      res = await estadoService.insertarEstado({
        nombreEstado: datos.nombre_Estado,
        activo: datos.activo,
      });
    }

    // Validar que el mensaje contenga "correctamente" o "exitosamente" (case insensitive)
    const mensaje = res?.mensaje || "";
    const exitoRegex = /(correctamente|exitosamente)/i;
    const success = res?.numero > 0 || res?.success || exitoRegex.test(mensaje);

    if (success) {
      cerrarModal();
      await Swal.fire(
        modoEdicion ? "Actualizado" : "Agregado",
        mensaje || "Operación exitosa",
        "success"
      );
      cargarDatos();
    } else {
      cerrarModal();
      await Swal.fire("Error", mensaje || "Error desconocido", "error");
    }
  } catch (error) {
    cerrarModal();
    const msg = error.response?.data?.mensaje || error.message || "Error al guardar el estado";
    await Swal.fire("Error", msg, "error");
  } finally {
    setFormLoading(false);
  }
};

  const datosFiltrados = estados.filter((e) =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
          <span className="text-green-500 font-semibold flex items-center gap-1">✔ Activo</span>
        ) : (
          <span className="text-red-500 font-semibold flex items-center gap-1">✘ Inactivo</span>
        ),
    },
  ];

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}>
      <div className={`shadow-md rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide ${texto}`}>
            Gestión de Estados
          </h2>
        </div>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={estados.filter((e) => e.activo).length}
          inactivos={estados.filter((e) => !e.activo).length}
          total={estados.length}
          onNuevo={abrirModalNuevo}
          modoOscuro={modoOscuro}
        />

        <TablaBase
          datos={datosFiltrados}
          columnas={columnas}
          modoOscuro={modoOscuro}
          onEditar={handleEditar}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
        />

        <ModalBase
          isOpen={modalOpen}
          onClose={cerrarModal}
          titulo={modoEdicion ? "Editar Estado" : "Nuevo Estado"}
          modoOscuro={modoOscuro}
        >
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Estado"
          >
            <div className="space-y-4">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del estado"
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
  );
};

export default FrmEstados;
