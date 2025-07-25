import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import usuarioRolService from "../../services/UsuariosRoles";
import usuarioService from "../../services/Usuario";
import rolService from "../../services/Roles";
import estadoService from "../../services/Estado";

import TablaBase from "../../shared/TablaBase";
import ModalBase from "../../shared/ModalBase";
import BuscadorBase from "../../shared/BuscadorBase";
import ContadoresBase from "../../shared/ContadoresBase";

const FrmUsuariosRoles = () => {
  const modoOscuro = useSelector((state) => state.tema.modoOscuro);

  const [usuariosRoles, setUsuariosRoles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);

  const [form, setForm] = useState({
    idUsuarioRoles: 0,
    idUsuario: "",
    idRol: "",
    idEstado: 1,
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Fetch inicial
  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      const [resUR, resU, resR, resE] = await Promise.all([
        usuarioRolService.listarUsuariosRoles(),
        usuarioService.listarUsuarios(),
        rolService.listarRoles(),
        estadoService.listarEstados(),
      ]);

      const estadosFiltrados = resE.filter((e) => e.idEstado === 1 || e.idEstado === 2);

      const data = resUR.map((ur) => {
        const usuario = resU.find((u) => u.idUsuario === ur.idUsuario);
        const rol = resR.find((r) => r.idRol === ur.idRol);
        const estado = estadosFiltrados.find((e) => e.idEstado === ur.idEstado);
        return {
          ...ur,
          nombreUsuario: usuario?.nombreCompleto || "N/D",
          nombreRol: rol?.nombreRol || "N/D",
          nombreEstado: estado?.nombreEstado || "N/D",
        };
      });

      setUsuariosRoles(data);
      setUsuarios(resU);
      setRoles(resR);
      setEstados(estadosFiltrados);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  const abrirModal = () => {
    setModoEdicion(false);
    setForm({ idUsuarioRoles: 0, idUsuario: "", idRol: "", idEstado: 1 });
    setModalOpen(true);
  };

  const abrirModalEdicion = (item) => {
    setModoEdicion(true);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleGuardar = async () => {
    try {
      const datos = {
        idUsuario: Number(form.idUsuario),
        idRol: Number(form.idRol),
        idEstado: Number(form.idEstado),
      };

      let res;
      if (modoEdicion) {
        datos.idUsuarioRoles = form.idUsuarioRoles;
        res = await usuarioRolService.actualizarUsuarioRol(datos);
      } else {
        res = await usuarioRolService.insertarUsuarioRol(datos);
      }

      if (res.success) {
        Swal.fire("Éxito", res.message, "success");
        setModalOpen(false);
        obtenerDatos();
      } else {
        Swal.fire("Error", res.message, "error");
      }
    } catch (error) {
      console.error("Error al guardar:", error.message);
    }
  };

  const columnas = [
    { key: "idUsuarioRoles", label: "ID" },
    { key: "nombreUsuario", label: "Usuario" },
    { key: "nombreRol", label: "Rol" },
    { key: "nombreEstado", label: "Estado" },
  ];

  const datosFiltrados = usuariosRoles.filter((item) =>
    item.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  const total = usuariosRoles.length;
  const activos = usuariosRoles.filter((u) => u.idEstado === 1).length;
  const inactivos = usuariosRoles.filter((u) => u.idEstado === 2).length;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Contadores y botón */}
      <ContadoresBase
        total={total}
        activos={activos}
        inactivos={inactivos}
        onAgregar={abrirModal}
      />

      {/* Buscador */}
      <BuscadorBase
        valor={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre de usuario..."
      />

      {/* Tabla */}
      <TablaBase
        datos={datosFiltrados}
        columnas={columnas}
        modoOscuro={modoOscuro}
        texto="text-gray-800 dark:text-white"
        onEditar={abrirModalEdicion}
        encabezadoClase="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
      />

      {/* Modal */}
      <ModalBase
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onGuardar={handleGuardar}
        titulo={modoEdicion ? "Editar Asignación" : "Nueva Asignación"}
      >
        {/* Campos */}
        <div className="grid gap-4">
          <select
            name="idUsuario"
            value={form.idUsuario}
            onChange={handleChange}
            className="p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombreCompleto}
              </option>
            ))}
          </select>

          <select
            name="idRol"
            value={form.idRol}
            onChange={handleChange}
            className="p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Seleccione un rol</option>
            {roles.map((r) => (
              <option key={r.idRol} value={r.idRol}>
                {r.nombreRol}
              </option>
            ))}
          </select>

          <select
            name="idEstado"
            value={form.idEstado}
            onChange={handleChange}
            className="p-2 rounded bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Seleccione estado</option>
            {estados.map((e) => (
              <option key={e.idEstado} value={e.idEstado}>
                {e.nombreEstado}
              </option>
            ))}
          </select>
        </div>
      </ModalBase>
    </div>
  );
};

export default FrmUsuariosRoles;
