import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import permisoService from "../../services/Permiso";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

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
  const [form, setForm] = useState({
    idPermiso: null,
    nombrePermiso: "",
    activo: "true",
  });

  useEffect(() => {
    cargarPermisos();
  }, []);

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

  const permisosFiltrados = permisos.filter((p) =>
    p.nombrePermiso.toLowerCase().includes(busqueda.toLowerCase())
  );

  const columnas = [
    { key: "nombrePermiso", label: "Nombre" },
    { key: "creador", label: "Creador" },
    { key: "modificador", label: "Modificador" },
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
            Activo
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
            Inactivo
          </span>
        ),
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
    { key: "fechaModificacion", label: "Fecha Modificación" },
  ];

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}>
      <div className={`shadow-md rounded-xl p-6 ${fondo}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl md:text-3xl font-extrabold tracking-wide ${modoOscuro ? "text-white" : "text-gray-800"}`}>
            Gestión de Permisos
          </h2>
        </div>

        <BuscadorBase
          placeholder="Buscar permisos..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          modoOscuro={modoOscuro}
        />

        <ContadoresBase
          activos={permisos.filter((p) => p.activo).length}
          inactivos={permisos.filter((p) => !p.activo).length}
          total={permisos.length}
          onNuevo={abrirNuevo}
          modoOscuro={modoOscuro}
        />

        <TablaBase
          datos={permisosFiltrados}
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
          titulo={modoEdicion ? "Editar Permiso" : "Nuevo Permiso"}
          modoOscuro={modoOscuro}
        >
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
  );
};

export default FrmPermisos;
