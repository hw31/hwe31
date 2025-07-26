import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import tipoCatalogoService from "../../services/TipoCatalogo";
import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmTipoCatalogo = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [busqueda, setBusqueda] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formTipo, setFormTipo] = useState("activos"); // "activos" o "personalizados"

  const [form, setForm] = useState({ idTipoCatalogo: 0, nombre: "", descripcion: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [activos, setActivos] = useState([]);
  const [personalizados, setPersonalizados] = useState([]);
  const [loadingActivos, setLoadingActivos] = useState(false);
  const [loadingPersonalizados, setLoadingPersonalizados] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoadingActivos(true);
      setLoadingPersonalizados(true);

      const res = await tipoCatalogoService.listarTiposCatalogo();
      const data = res.data || [];

      const activosList = data.filter((d) => d.activo);
      const personalizadosList = data.filter((d) => !d.activo);

      setActivos(activosList);
      setPersonalizados(personalizadosList);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los tipos", "error");
    } finally {
      setLoadingActivos(false);
      setLoadingPersonalizados(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModal = (tipo) => {
    setFormTipo(tipo);
    setModoEdicion(false);
    setForm({ idTipoCatalogo: 0, nombre: "", descripcion: "" });
    setFormError("");
    setModalOpen(true);
  };

  const editarModal = (item, tipo) => {
    setFormTipo(tipo);
    setModoEdicion(true);
    setForm({
      idTipoCatalogo: item.idTipoCatalogo,
      nombre: item.nombreTipoCatalogo || item.nombre,
      descripcion: item.descripcion || (item.activo ? "Activo" : "Inactivo"),
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return setFormError("El nombre es obligatorio.");
    if (!form.descripcion) return setFormError("Seleccione un estado.");

    const datos = {
      nombreTipoCatalogo: form.nombre.trim(),
      activo: form.descripcion === "Activo",
    };

    try {
      setFormLoading(true);
      const res = modoEdicion
        ? await tipoCatalogoService.actualizarTipoCatalogo({ idTipoCatalogo: form.idTipoCatalogo, ...datos })
        : await tipoCatalogoService.insertarTipoCatalogo(datos);

      if (res.Numero > 0) {
        setModalOpen(false);
        Swal.fire("Éxito", res.Mensaje, "success");
        cargarDatos();
      } else {
        Swal.fire("Error", res.Mensaje || "Error desconocido", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Error al guardar", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const filtro = (arr) =>
    arr.filter((item) => item.nombreTipoCatalogo.toLowerCase().includes(busqueda.toLowerCase()));

  const columnas = [
    { key: "nombreTipoCatalogo", label: "Nombre" },
    {
      key: "activo",
      label: "Estado",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold">Activo</span>
        ) : (
          <span className="text-red-500 font-semibold">Inactivo</span>
        ),
    },
  ];

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-800 min-h-screen" : "bg-gray-50"}`}>
      <h1 className={`text-3xl font-bold mb-4 ${modoOscuro ? "text-white" : "text-gray-800"}`}>
        Tipos de Catálogo
      </h1>

      <BuscadorBase
        placeholder="Buscar en ambas tablas..."
        valor={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        modoOscuro={modoOscuro}
      />

      {/* Tabla de activos */}
      <div className="mb-10">
        <ContadoresBase
          titulo="Tipos Activos"
          activos={activos.length}
          inactivos={0}
          total={activos.length}
          modoOscuro={modoOscuro}
          onNuevo={() => abrirModal("activos")}
        />
        <TablaBase
          datos={filtro(activos)}
          columnas={columnas}
          modoOscuro={modoOscuro}
          loading={loadingActivos}
          onEditar={(item) => editarModal(item, "activos")}
        />
      </div>

      {/* Tabla de personalizados */}
      <div>
        <ContadoresBase
          titulo="Tipos Inactivos / Personalizados"
          activos={0}
          inactivos={personalizados.length}
          total={personalizados.length}
          modoOscuro={modoOscuro}
          onNuevo={() => abrirModal("personalizados")}
        />
        <TablaBase
          datos={filtro(personalizados)}
          columnas={columnas}
          modoOscuro={modoOscuro}
          loading={loadingPersonalizados}
          onEditar={(item) => editarModal(item, "personalizados")}
        />
      </div>

      {/* Modal */}
      <ModalBase
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo={modoEdicion ? "Editar Tipo de Catálogo" : "Nuevo Tipo de Catálogo"}
        modoOscuro={modoOscuro}
      >
        <FormularioBase
          onSubmit={handleGuardar}
          onCancel={() => setModalOpen(false)}
          modoOscuro={modoOscuro}
          formError={formError}
          formLoading={formLoading}
          titulo="Tipo de Catálogo"
        >
          <div className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
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
  );
};

export default FrmTipoCatalogo;
