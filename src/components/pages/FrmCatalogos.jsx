import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { BiPlus } from "react-icons/bi";

import catalogoService from "../../services/Catalogos";
import tipoCatalogoService from "../../services/TipoCatalogo";
import usuarioService from "../../services/Usuario";
import BuscadorBase from "../Shared/BuscadorBase";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";
import TablaBase from "../Shared/TablaBase";

const FrmCatalogosUnificado = () => {
  const { idUsuario } = useSelector((state) => state.auth.usuario);

  const [catalogos, setCatalogos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    idTipo: 0,
    nombreTipoCatalogo: "",
    activoTipo: true,

    idCatalogo: 0,
    descripcionCatalogo: "",
    activoCatalogo: true,
    idTipoSeleccionado: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [resTipos, resCatalogos, resUsuarios] = await Promise.all([
      tipoCatalogoService.listarTiposCatalogo(),
      catalogoService.listarCatalogo(),
      usuarioService.listarUsuario(),
    ]);
    setTipos(resTipos.data || []);
    setCatalogos(resCatalogos.resultado || []);
    setUsuarios(resUsuarios.data || []);
  };

  const obtenerNombreUsuario = (usuarioId) =>
    usuarios.find((u) => u.id_Usuario === usuarioId)?.persona?.trim() || "ND";

  const dataUnificada = catalogos.map((c) => {
    const tipo = tipos.find((t) => t.idTipoCatalogo === c.idTipoCatalogo);
    return {
      idCatalogo: c.idCatalogo,
      descripcionCatalogo: c.descripcionCatalogo,
      activoCatalogo: c.activo,
      creadoPorCatalogo: obtenerNombreUsuario(c.creadoPor),
      modificadoPorCatalogo: obtenerNombreUsuario(c.id_Modificador),
      fechaCreacionCatalogo: c.fecha_Creacion,
      fechaModificacionCatalogo: c.fecha_Modificacion,

      idTipo: tipo?.idTipoCatalogo || 0,
      nombreTipoCatalogo: tipo?.nombreTipoCatalogo || "ND",
      activoTipo: tipo?.activo ?? true,
      creadoPorTipo: obtenerNombreUsuario(tipo?.id_Creador),
      modificadoPorTipo: obtenerNombreUsuario(tipo?.id_Modificador),
      fechaCreacionTipo: tipo?.fecha_Creacion,
      fechaModificacionTipo: tipo?.fecha_Modificacion,
    };
  }).filter((item) =>
    item.descripcionCatalogo.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.nombreTipoCatalogo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      idTipo: 0,
      nombreTipoCatalogo: "",
      activoTipo: true,
      idCatalogo: 0,
      descripcionCatalogo: "",
      activoCatalogo: true,
      idTipoSeleccionado: 0,
    });
  };

  const handleEditar = (item) => {
    setFormData({
      idTipo: item.idTipo,
      nombreTipoCatalogo: item.nombreTipoCatalogo,
      activoTipo: item.activoTipo,

      idCatalogo: item.idCatalogo,
      descripcionCatalogo: item.descripcionCatalogo,
      activoCatalogo: item.activoCatalogo,
      idTipoSeleccionado: item.idTipo,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleAgregar = () => {
    resetForm();
    setModoEdicion(false);
    setModalOpen(true);
  };

  const handleGuardarTipo = async () => {
    try {
      if (!formData.nombreTipoCatalogo.trim()) return;
      const now = new Date();
      const tipoObj = {
        idTipoCatalogo: formData.idTipo,
        nombreTipoCatalogo: formData.nombreTipoCatalogo,
        activo: formData.activoTipo,
        id_Creador: modoEdicion ? undefined : idUsuario,
        fecha_Creacion: modoEdicion ? undefined : now,
        id_Modificador: modoEdicion ? idUsuario : undefined,
        fecha_Modificacion: modoEdicion ? now : undefined,
      };
      if (modoEdicion) {
        await tipoCatalogoService.actualizarTipoCatalogo(tipoObj);
        if (!formData.activoTipo) {
          const relacionados = catalogos.filter(c => c.idTipoCatalogo === formData.idTipo && c.activo);
          for (const c of relacionados) {
            await catalogoService.actualizarCatalogo({
              ...c,
              activo: false,
              id_Modificador: idUsuario,
              fecha_Modificacion: now,
            });
          }
        }
        Swal.fire("Éxito", "Tipo actualizado correctamente", "success");
      } else {
        await tipoCatalogoService.insertarTipoCatalogo(tipoObj);
        Swal.fire("Éxito", "Tipo creado correctamente", "success");
      }
      cargarDatos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar el tipo", "error");
    }
  };

  const handleGuardarCatalogo = async () => {
    try {
      if (!formData.descripcionCatalogo.trim() || !formData.idTipoSeleccionado) return;
      const now = new Date();
      const catObj = {
        idCatalogo: formData.idCatalogo,
        descripcionCatalogo: formData.descripcionCatalogo,
        idTipoCatalogo: formData.idTipoSeleccionado,
        activo: formData.activoCatalogo,
        id_Creador: modoEdicion ? undefined : idUsuario,
        fecha_Creacion: modoEdicion ? undefined : now,
        id_Modificador: modoEdicion ? idUsuario : undefined,
        fecha_Modificacion: modoEdicion ? now : undefined,
      };
      if (modoEdicion) {
        await catalogoService.actualizarCatalogo(catObj);
        Swal.fire("Éxito", "Catálogo actualizado correctamente", "success");
      } else {
        await catalogoService.insertarCatalogo(catObj);
        Swal.fire("Éxito", "Catálogo creado correctamente", "success");
      }
      cargarDatos();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo guardar catálogo", "error");
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Catálogos Unificados</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={handleAgregar}
        >
          <BiPlus /> Agregar
        </button>
      </div>

      <BuscadorBase
        placeholder="Buscar por descripción o tipo"
        valor={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <TablaBase
        datos={dataUnificada}
        columnas={[
          { key: "descripcionCatalogo", label: "Catálogo" },
          { key: "nombreTipoCatalogo", label: "Tipo" },
          { key: "creadoPorCatalogo", label: "Creado por (Catálogo)" },
          { key: "modificadoPorCatalogo", label: "Modificado por (Catálogo)" },
          { key: "fechaCreacionCatalogo", label: "Fecha creación catálogo" },
          { key: "fechaModificacionCatalogo", label: "Fecha modif catálogo" },
          { key: "creadoPorTipo", label: "Creado por (Tipo)" },
          { key: "modificadoPorTipo", label: "Modificado por (Tipo)" },
          { key: "fechaCreacionTipo", label: "Fecha creación tipo" },
          { key: "fechaModificacionTipo", label: "Fecha modif tipo" },
          {
            key: "activoCatalogo", label: "Activo Catálogo",
            render: (item) => item.activoCatalogo
              ? <FaCheckCircle className="text-green-500" />
              : <FaTimesCircle className="text-red-500" />
          },
          {
            key: "activoTipo", label: "Activo Tipo",
            render: (item) => item.activoTipo
              ? <FaCheckCircle className="text-green-500" />
              : <FaTimesCircle className="text-red-500" />
          },
        ]}
        onEditar={handleEditar}
      />

      <ModalBase isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <FormularioBase
          titulo="Tipo de Catálogo"
          modoEdicion={modoEdicion}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleGuardarTipo}
        >
          <input
            type="text"
            value={formData.nombreTipoCatalogo}
            onChange={(e) => setFormData({ ...formData, nombreTipoCatalogo: e.target.value })}
            placeholder="Nombre del tipo"
            className="border p-2 rounded w-full mb-2"
          />
          <select
            value={formData.activoTipo}
            onChange={(e) => setFormData({ ...formData, activoTipo: e.target.value === "true" })}
            className="border p-2 rounded w-full"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </FormularioBase>

        <FormularioBase
          titulo="Catálogo"
          modoEdicion={modoEdicion}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleGuardarCatalogo}
        >
          <input
            type="text"
            value={formData.descripcionCatalogo}
            onChange={(e) => setFormData({ ...formData, descripcionCatalogo: e.target.value })}
            placeholder="Descripción del catálogo"
            className="border p-2 rounded w-full mb-2"
          />
          <select
            value={formData.activoCatalogo}
            onChange={(e) => setFormData({ ...formData, activoCatalogo: e.target.value === "true" })}
            className="border p-2 rounded w-full mb-2"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
          <select
            value={formData.idTipoSeleccionado}
            onChange={(e) => setFormData({ ...formData, idTipoSeleccionado: parseInt(e.target.value) })}
            className="border p-2 rounded w-full"
          >
            <option value={0}>Seleccione un tipo</option>
            {tipos.map((t) => (
              <option key={t.idTipoCatalogo} value={t.idTipoCatalogo}>
                {t.nombreTipoCatalogo}
              </option>
            ))}
          </select>
        </FormularioBase>
      </ModalBase>
    </div>
  );
};

export default FrmCatalogosUnificado;