import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import transaccionRolService from "../../services/TransaccionxRol";
import tipoTransaccionService from "../../services/TiposTransaccion";
import rolService from "../../services/Roles";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const TransaccionesRoles = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    idTransaccionesxRol: 0,
    idRol: "",
    idTransaccion: "",
    idEstado: 1,
  });

  const [tiposTransaccion, setTiposTransaccion] = useState([]);
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);

  // Búsqueda para tabla
  const [busqueda, setBusqueda] = useState("");
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  // Autocomplete dropdown
  const [filtroTransaccion, setFiltroTransaccion] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resTR, resTipos, resRoles, resEstados] = await Promise.all([
        transaccionRolService.listarTransaccionesPorRol(),
        tipoTransaccionService.listarTiposTransaccion(),
        rolService.listarRoles(),
        estadoService.listarEstados(),
      ]);

      setTiposTransaccion(resTipos?.data || resTipos?.resultado || []);

      const rolesRes = resRoles?.data || resRoles?.resultado || [];
      const rolesNormalizados = rolesRes.map((r) => ({
        idRol: r.iD_Rol ?? r.idRol,
        nombreRol: r.nombre_Rol ?? r.nombreRol,
        activo: r.activo,
      }));
      setRoles(rolesNormalizados);

      const estadosRaw = resEstados?.data || resEstados?.datos || resEstados?.resultado || [];
      const estadosNormalizados = estadosRaw.map((e) => ({
        iD_Estado: e.iD_Estado ?? e.idEstado ?? e.ID_Estado ?? e.id_estado,
        nombre_Estado: e.nombre_Estado ?? e.nombreEstado ?? e.nombre_estado ?? e.Nombre_Estado,
      }));
      const estadosFiltrados = estadosNormalizados.filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2);
      setEstados(estadosFiltrados);

      const transacciones = resTR?.data || resTR?.resultado || [];
      const listaFormateada = transacciones.map((item) => ({
        ...item,
        fechaCreacionFormat: formatearFecha(item.fechaCreacion),
        fechaModificacionFormat: formatearFecha(item.fechaModificacion),
        activo: item.idEstado === 1,
      }));
      setDatos(listaFormateada);
      setFormError("");
    } catch (error) {
      console.error("Error cargando datos:", error);
      setDatos([]);
      setFormError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado búsqueda tabla
  const busquedaLower = busqueda.toLowerCase();
  const filtrados = datos.filter(
    (t) =>
      t.descripcion?.toLowerCase().includes(busquedaLower) ||
      t.nombreRol?.toLowerCase().includes(busquedaLower)
  );

  // Paginación:
  const totalPaginas = Math.ceil(filtrados.length / filasPorPagina);
  const indexUltima = paginaActual * filasPorPagina;
  const indexPrimera = indexUltima - filasPorPagina;
  const datosPaginados = filtrados.slice(indexPrimera, indexUltima);

  const activos = filtrados.filter((t) => t.activo).length;
  const inactivos = filtrados.length - activos;

  // Abrir modal nuevo
  const abrirModalNuevo = () => {
    setForm({
      idTransaccionesxRol: 0,
      idRol: "",
      idTransaccion: "",
      idEstado: 1,
    });
    setFiltroTransaccion("");
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalOpen(false);
    setFormLoading(false);
    setFormError("");
    setFiltroTransaccion("");
    setMostrarDropdown(false);
  };

  // Cargar para editar
  const cargarParaEditar = (item) => {
    setForm({
      idTransaccionesxRol: item.idTransaccionesxRol,
      idRol: item.idRol,
      idTransaccion: item.idTransaccion,
      idEstado: item.idEstado,
    });
    // Set filtro para mostrar en input el texto correcto:
    const tipoSel = tiposTransaccion.find((t) => t.idTipoTransaccion === item.idTransaccion);
    setFiltroTransaccion(tipoSel ? tipoSel.descripcion : "");
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "idTransaccion") {
      setFiltroTransaccion(value);
      setMostrarDropdown(true);
      setForm((prev) => ({ ...prev, idTransaccion: "" }));
    } else if (name === "idEstado") {
      setForm((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setFormError("");
  };

  // Guardar formulario
  const handleGuardar = async () => {
    if (!form.idRol || !form.idTransaccion) {
      setFormError("Debe seleccionar Rol y Transacción.");
      return;
    }

    try {
      setFormLoading(true);
      const payload = {
        idRol: parseInt(form.idRol),
        idTransaccion: parseInt(form.idTransaccion),
        idEstado: form.idEstado,
      };

      let res;
      if (modoEdicion) {
        payload.idTransaccionesxRol = form.idTransaccionesxRol;
        res = await transaccionRolService.actualizarTransaccionPorRol(payload);
      } else {
        res = await transaccionRolService.insertarTransaccionPorRol(payload);
      }

      cerrarModal();

      const numero = res?.numero;
      const mensaje = res?.mensaje || res?.message || "Operación realizada.";
      const exito = typeof numero === "number" ? numero > 0 : (res?.success ?? true);

      await Swal.fire({
        icon: exito ? "success" : "error",
        title: exito ? "Éxito" : "Error",
        text: mensaje,
        confirmButtonColor: exito ? "#3085d6" : "#d33",
      });

      if (exito) cargarDatos();
    } catch (error) {
      cerrarModal();

      let mensajeError = "Error inesperado";

      if (error && typeof error === "object") {
        if ("mensaje" in error) {
          mensajeError = error.mensaje;
        } else if ("message" in error) {
          mensajeError = error.message;
        }
      } else if (typeof error === "string") {
        mensajeError = error;
      }

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
        confirmButtonColor: "#d33",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Autocomplete: filtrar tipos de transacción según filtroTransaccion
  const opcionesFiltradas = tiposTransaccion.filter((t) =>
    t.descripcion.toLowerCase().includes(filtroTransaccion.toLowerCase())
  );

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  // Seleccionar opción autocomplete
  const seleccionarOpcion = (opcion) => {
    setFiltroTransaccion(opcion.descripcion);
    setForm((prev) => ({ ...prev, idTransaccion: opcion.idTipoTransaccion }));
    setMostrarDropdown(false);
    inputRef.current?.focus();
  };

  const columnas = [
    { key: "idTransaccionesxRol", label: "ID", className: "text-center w-12" },
    { key: "descripcion", label: "Transacción" },
    { key: "nombreRol", label: "Rol" },
    { key: "nombreCreador", label: "Creador" },
    { key: "fechaCreacionFormat", label: "Fecha Creación" },
    { key: "nombreModificador", label: "Modificador" },
    { key: "fechaModificacionFormat", label: "Fecha Modificación" },
    {
      key: "activo",
      label: "Activo",
      className: "text-center w-16",
      render: (item) =>
        item.activo ? (
          <span className="text-green-500 font-semibold select-none">✔</span>
        ) : (
          <span className="text-red-500 font-semibold select-none">✘</span>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-[900px] w-full rounded-2xl p-6">
      <div
        className={`w-full px-4 rounded-2xl shadow-md p-6 ${
          modoOscuro ? "bg-gray-900 text-white shadow-gray-700" : "bg-white text-gray-900 shadow-gray-300"
        }`}
      >
        <h2 className="text-3xl font-bold mb-4 text-center sm:text-left cursor-pointer select-none">
          Gestión de Transacciones por Rol
        </h2>

        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <BuscadorBase
            placeholder="Buscar transacciones o roles..."
            valor={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            modoOscuro={modoOscuro}
          />
        </div>

        <ContadoresBase activos={activos}
         inactivos={inactivos} total={filtrados.length} 
         onNuevo={abrirModalNuevo} 
         modoOscuro={modoOscuro} 
         />
         {/*SELECT FILAS*/}
        <div className="mb-2 flex justify-start items-center gap-2 text-sm">
        <label htmlFor="filasPorPagina" className="font-semibold select-none">
          Filas por página:
        </label>
        <select
          id="filasPorPagina"
          value={filasPorPagina}
          onChange={(e) => {
            setFilasPorPagina(parseInt(e.target.value));
            setPaginaActual(1);
          }}
          className={`w-[5rem] px-3 py-1 rounded border ${
            modoOscuro ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
          }`}
        >
          {[10, 30, 45, 60, 100].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
        <TablaBase
          datos={datosPaginados}
          columnas={columnas}
          modoOscuro={modoOscuro}
          onEditar={cargarParaEditar}
          loading={loading}
          texto={texto}
          encabezadoClase={encabezado}
        />
        
          {/*BOTONES SIGUIENTES*/}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <button
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Anterior
          </button>
          <span className="font-semibold select-none">
            Página {paginaActual} de {totalPaginas || 1}
          </span>
          <button
            disabled={paginaActual === totalPaginas || totalPaginas === 0}
            onClick={() => setPaginaActual((p) => (p < totalPaginas ? p + 1 : totalPaginas))}
            className={`rounded px-4 py-2 text-white ${
              paginaActual === totalPaginas || totalPaginas === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors`}
          >
            Siguiente
          </button>
        </div>

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
     <FormularioBase
  onSubmit={handleGuardar}

            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo="Transacción por Rol"
          >
            <div className="space-y-4">
              <label className={`${texto} font-semibold`}>Tipo de Transacción:</label>
              <div className="relative">
                <input
                  type="text"
                  name="idTransaccion"
                  value={filtroTransaccion}
                  onChange={handleInputChange}
                  autoComplete="off"
                  ref={inputRef}
                  className={`w-full px-3 py-2 border rounded ${
                    modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                  }`}
                  onFocus={() => setMostrarDropdown(true)}
                  placeholder="Escriba para buscar..."
                />
                {mostrarDropdown && opcionesFiltradas.length > 0 && (
                  <ul
                    ref={dropdownRef}
                    className={`absolute z-10 w-full max-h-48 overflow-auto rounded border ${
                      modoOscuro ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                    }`}
                  >
                    {opcionesFiltradas.map((opcion) => (
                      <li
                        key={opcion.idTipoTransaccion}
                        className="cursor-pointer px-3 py-2 hover:bg-blue-600 hover:text-white"
                        onClick={() => seleccionarOpcion(opcion)}
                      >
                        {opcion.descripcion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <label className={`${texto} font-semibold`}>Rol:</label>
              <select
                name="idRol"
                value={form.idRol}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <option value="">-- Seleccione --</option>
                {roles.map((r) => (
                  <option key={r.idRol} value={r.idRol}>
                    {r.nombreRol}
                  </option>
                ))}
              </select>

              <label className={`${texto} font-semibold`}>Estado:</label>
              <select
                name="idEstado"
                value={form.idEstado}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded ${
                  modoOscuro ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-800 border-gray-300"
                }`}
              >
                <option value="">-- Seleccione --</option>
                {estados.map((e) => (
                  <option key={e.iD_Estado} value={e.iD_Estado}>
                    {e.nombre_Estado}
                  </option>
                ))}
              </select>
            </div>
          </FormularioBase>
        </ModalBase>
      </div>
    </div>
  );
};

export default TransaccionesRoles;
