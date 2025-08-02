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
  const [form, setForm] = useState({
    idRol: 0,
    nombre: "",
    descripcion: "",
  });

  // Formatear fecha para mostrar en tabla
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

  // Adaptar datos para tabla con creador, modificador, fechas visibles
const adaptarDatosRoles = (datos) =>
  datos.map((r) => ({
    idRol: r.iD_Rol,
    nombre: r.nombre_Rol,
    activo: r.activo,
    fechaCreacion: formatearFecha(r.fecha_Creacion),
    fechaModificacion: formatearFecha(r.fecha_Modificacion),
    nombreCreador: r.nombre_Creador,
    nombreModificador: r.nombre_Modificador,
  }));

  useEffect(() => {
    cargarRoles();
  }, []);

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
    descripcion: rol.descripcion, // Ya viene como "Activo" o "Inactivo"
  });
  setModoEdicion(true);
  setModalOpen(true);
};

 const handleGuardar = async () => {
  setFormError("");

  if (!form.nombre.trim()) {
    return setFormError("El nombre es obligatorio");
  }
  if (!form.descripcion) {
    return setFormError("Seleccione un estado");
  }

  try {
    setFormLoading(true);

    let res;
    if (modoEdicion) {
      // Actualizar
      const datos = {
        id_Rol: form.idRol,
        nombre_Rol: form.nombre.trim(),
        activo: form.descripcion === "Activo",
      };
      res = await rolService.actualizarRol(datos);
    } else {
      // Insertar
      const datos = {
        nombreRol: form.nombre.trim(),
        activo: form.descripcion === "Activo",
      };
      res = await rolService.insertarRol(datos);
    }

    // Validar respuesta exitosa según campo 'numero' o 'success'
    if (res.numero === undefined) {
      if (res.success) {
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
    } else {
      // Validar 'numero' que viene en la respuesta
      if (res.numero > 0) {
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
    }
  } catch (error) {
    cerrarModal();
    console.error(error);

    // Obtener mensaje desde error.response.data (axios) 
    const mensajeError =
      error.response?.data?.mensaje ||
      error.message ||
      "Hubo un problema al guardar el rol";

    await Swal.fire("Error", mensajeError, "error");
    setFormLoading(false);
  }
};
  const datosFiltrados = roles.filter((rol) =>
    rol.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const columnas = [
    //{ key: "idRol", label: "ID" },
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
        <FaCheckCircle className="text-xl" /> Activo
      </span>
    ) : (
      <span className="text-red-500 font-semibold flex items-center gap-2">
        <FaTimesCircle className="text-xl" /> Inactivo
      </span>
    ),
}
  ];

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}
      style={{ paddingTop: 1 }}  >
      <div className={`shadow-md rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
            Gestión de Roles
          </h2>
        </div>

        <BuscadorBase
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={roles.filter((r) => r.activo === true).length}
          inactivos={roles.filter((r) => r.activo === false).length}
          total={roles.length}
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
          titulo={modoEdicion ? "Editar Rol" : "Nuevo Rol"}
          modoOscuro={modoOscuro}
        >
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
  );
};

export default FrmRoles;
