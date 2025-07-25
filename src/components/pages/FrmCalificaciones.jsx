import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import TablaBase from "../Shared/TablaBase";
import BuscadorBase from "../Shared/BuscadorBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

import calificacionService from "../../services/Calificaciones";
import materiaService from "../../services/Materias";
import tipoCalificacionService from "../../services/TipoCalificacion";
import estadoService from "../../services/Estado";
import inscripcionService from "../../services/Inscripcion";
import usuarioService from "../../services/Usuario"; 

const FrmCalificaciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const idUsuario = useSelector((state) => state.auth.idUsuario);
  const rol = useSelector((state) => state.auth.rol?.toLowerCase());

  const [calificaciones, setCalificaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [tiposCalificacion, setTiposCalificacion] = useState([]);
  const [estados, setEstados] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // <-- Usuarios cargados

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    idCalificacion: 0,
    idInscripcion: "",
    idTipoCalificacion: "",
    calificacion: "",
    idEstado: 1,
  });
  const [busqueda, setBusqueda] = useState("");

  const contadorActivos = calificaciones.filter((c) => c.idEstado === 1).length;
  const contadorInactivos = calificaciones.filter((c) => c.idEstado === 2).length;
  const contadorTotal = calificaciones.length;

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

  const esAdmin = rol === "admin" || rol === "administrador";
  const esDocente = rol === "docente";
  const esEstudiante = rol === "estudiante";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [
          calificacionesData,
          materiasData,
          tiposCalifData,
          estadosData,
          inscripcionesData,
          usuariosData,
        ] = await Promise.all([
          calificacionService.listarCalificacion(),
          materiaService.listarMaterias(),
          tipoCalificacionService.listarTiposCalificacion(),
          estadoService.listarEstados(),
          inscripcionService.listarInscripciones(),
          usuarioService.listarUsuarios(), // <-- carga usuarios
        ]);

        setCalificaciones(calificacionesData.data || []);
        setMaterias(materiasData.resultado || []);
        setTiposCalificacion(tiposCalifData.resultado || []);
        setEstados(estadosData.data || []);
        setInscripciones(inscripcionesData.resultado || []);
        setUsuarios(usuariosData.data || []);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
      }
    };
    cargarDatos();
  }, []);

  // Buscar nombre estudiante desde inscripcion => usuario
  const getNombreEstudiantePorInscripcion = (idInscripcion) => {
    const insc = inscripciones.find((i) => i.iD_Inscripcion === Number(idInscripcion));
    if (!insc) return "N/A";
    const usuarioEst = usuarios.find((u) => u.id_Usuario === insc.id_Usuario);
    return usuarioEst ? usuarioEst.persona.trim() : "N/A";
  };

  // Buscar docente (idUsuarioDocente) nombre
  // Para esto debes tener el campo idUsuarioDocente en calificacion (si no, no podrá mostrarse)
  const getNombreDocentePorIdUsuario = (idUsuarioDocente) => {
    const docente = usuarios.find((u) => u.id_Usuario === idUsuarioDocente);
    return docente ? docente.persona.trim() : "N/A";
  };

  // Filtra calificaciones según búsqueda (nombre estudiante o materia)
  const calificacionesFiltradas = calificaciones.filter((c) => {
    const nombreEstudiante = getNombreEstudiantePorInscripcion(c.idInscripcion).toLowerCase();
    const materiaNombre = materias.find((m) => m.idMateria === c.idMateria)?.nombreMateria.toLowerCase() || "";
    const textoBusqueda = busqueda.toLowerCase();

    return nombreEstudiante.includes(textoBusqueda) || materiaNombre.includes(textoBusqueda);
  });

  // Filtra por rol:
  // Admin ve todo
  // Docente ve solo las que él creó (idUsuarioDocente === idUsuario)
  // Estudiante ve solo las suyas (por inscripcion que esté asociada a su idUsuario)
  const filtrarPorRol = (lista) => {
    if (!rol) return [];

    if (esAdmin) return lista;

    if (esDocente) return lista.filter((c) => c.idUsuarioDocente === idUsuario);

    if (esEstudiante) {
      // Obtener inscripciones del estudiante
      const inscUsuario = inscripciones.filter((i) => i.id_Usuario === idUsuario).map(i => i.iD_Inscripcion);
      return lista.filter((c) => inscUsuario.includes(c.idInscripcion));
    }

    return [];
  };

  const listaMostrada = filtrarPorRol(calificacionesFiltradas);

  const abrirModalNuevo = () => {
    setForm({
      idCalificacion: 0,
      idInscripcion: "",
      idTipoCalificacion: "",
      calificacion: "",
      idEstado: 1,
    });
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (calificacion) => {
    setForm({
      idCalificacion: calificacion.idCalificacion,
      idInscripcion: calificacion.idInscripcion,
      idTipoCalificacion: calificacion.idTipoCalificacion,
      calificacion: calificacion.calificacion,
      idEstado: calificacion.idEstado,
    });
    setModoEdicion(true);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validarFormulario = () => {
    if (!form.idInscripcion) return "Debes seleccionar un estudiante (inscripción)";
    if (!form.idTipoCalificacion) return "Debes seleccionar un tipo de calificación";
    if (form.calificacion === "") return "Debes ingresar la calificación";
    if (isNaN(Number(form.calificacion)) || Number(form.calificacion) < 0 || Number(form.calificacion) > 100)
      return "La calificación debe ser un número entre 0 y 100";
    if (!form.idEstado) return "Debes seleccionar un estado";
    return null;
  };

  const guardar = async () => {
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      Swal.fire("Error", errorValidacion, "error");
      return;
    }

    try {
      let datosEnviar = {};

      if (modoEdicion) {
        if (esDocente) {
          datosEnviar = {
            idCalificacion: form.idCalificacion,
            idTipoCalificacion: Number(form.idTipoCalificacion),
            calificacion: Number(form.calificacion),
          };
        } else if (esAdmin) {
          datosEnviar = {
            idCalificacion: form.idCalificacion,
            idInscripcion: Number(form.idInscripcion),
            idTipoCalificacion: Number(form.idTipoCalificacion),
            calificacion: Number(form.calificacion),
            idEstado: Number(form.idEstado),
          };
        } else {
          Swal.fire("Error", "No tienes permiso para editar esta calificación.", "error");
          return;
        }
        await calificacionService.actualizarCalificaciones(datosEnviar);
        Swal.fire("Actualizado", "Calificación actualizada correctamente", "success");
      } else {
        if (esAdmin) {
          datosEnviar = {
            idInscripcion: Number(form.idInscripcion),
            idTipoCalificacion: Number(form.idTipoCalificacion),
            calificacion: Number(form.calificacion),
            idEstado: Number(form.idEstado),
          };
          await calificacionService.insertarCalificaciones(datosEnviar);
          Swal.fire("Registrado", "Calificación registrada correctamente", "success");
        } else {
          Swal.fire("Error", "No tienes permiso para registrar calificaciones.", "error");
          return;
        }
      }
      setModalOpen(false);
      const calificacionesData = await calificacionService.listarCalificacion();
      setCalificaciones(calificacionesData.data || []);
    } catch (error) {
      Swal.fire("Error", "Error al guardar la calificación", "error");
    }
  };

  const columnas = [
    { nombre: "Estudiante", key: "nombreEstudiante" },
    { nombre: "Materia", key: "materia" },
    { nombre: "Tipo", key: "tipoCalificacion" },
    { nombre: "Calificación", key: "calificacion" },
    { nombre: "Creado", key: "fechaCreacion" },
    { nombre: "Modificado", key: "fechaModificacion" },
    { nombre: "Estado", key: "estado" },
    { nombre: "Acciones", key: "acciones" },
  ];

  return (
    <div
      className={`${
        modoOscuro ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"
      } min-h-screen p-6`}
    >
      {rol !== "estudiante" && (
        <BuscadorBase
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholder="Buscar por estudiante o materia"
          modoOscuro={modoOscuro}
        />
      )}

      <ContadoresBase
        activo={contadorActivos}
        inactivo={contadorInactivos}
        total={contadorTotal}
        mostrarContadores={esAdmin}
        onNuevo={esAdmin ? abrirModalNuevo : null}
        modoOscuro={modoOscuro}
      />

      <TablaBase columnas={columnas} modoOscuro={modoOscuro}>
        {listaMostrada.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-4">
              No hay calificaciones para mostrar.
            </td>
          </tr>
        ) : (
          listaMostrada.map((c) => {
            const materia = materias.find((m) => m.idMateria === c.idMateria);
            const tipoCalif = tiposCalificacion.find((t) => t.idTipoCalificacion === c.idTipoCalificacion);
            const estado = estados.find((e) => e.idEstado === c.idEstado);
            const nombreEstudiante = getNombreEstudiantePorInscripcion(c.idInscripcion);

            return (
              <tr key={c.idCalificacion} className="hover:bg-blue-200 cursor-pointer">
                <td>{nombreEstudiante}</td>
                <td>{materia?.nombreMateria || "N/A"}</td>
                <td>{tipoCalif?.nombreTipoCalificacion || "N/A"}</td>
                <td>{c.calificacion}</td>
                <td>{formatearFecha(c.fechaCreacion)}</td>
                <td>{formatearFecha(c.fechaModificacion)}</td>
                <td>{estado?.nombreEstado || "N/A"}</td>
                <td className="flex gap-2 justify-center">
                  {(esAdmin || esDocente) && (
                    <button
                      onClick={() => abrirModalEditar(c)}
                      className="bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </TablaBase>

      {modalOpen && (
        <ModalBase
          titulo={modoEdicion ? "Editar Calificación" : "Nueva Calificación"}
          cerrar={() => setModalOpen(false)}
          modoOscuro={modoOscuro}
        >
          <FormularioBase>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                guardar();
              }}
              className="flex flex-col gap-4"
            >
              {/* Inscripción (Estudiante) */}
              <div>
                <label className="block mb-1 font-semibold">Estudiante (Inscripción)</label>
                <select
                  name="idInscripcion"
                  value={form.idInscripcion}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  disabled={modoEdicion || esDocente} // docente no puede cambiar inscripción
                  required
                >
                  <option value="">-- Selecciona Estudiante --</option>
                  {inscripciones.map((insc) => {
                    const estudiante = usuarios.find((u) => u.id_Usuario === insc.id_Usuario);
                    return (
                      <option key={insc.iD_Inscripcion} value={insc.iD_Inscripcion}>
                        {estudiante ? estudiante.persona.trim() : "N/A"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tipo Calificación */}
              <div>
                <label className="block mb-1 font-semibold">Tipo de Calificación</label>
                <select
                  name="idTipoCalificacion"
                  value={form.idTipoCalificacion}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  required
                  disabled={!(esAdmin || esDocente)}
                >
                  <option value="">-- Selecciona Tipo --</option>
                  {tiposCalificacion.map((t) => (
                    <option key={t.idTipoCalificacion} value={t.idTipoCalificacion}>
                      {t.nombreTipoCalificacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calificación */}
              <div>
                <label className="block mb-1 font-semibold">Calificación</label>
                <input
                  type="number"
                  name="calificacion"
                  min="0"
                  max="100"
                  value={form.calificacion}
                  onChange={handleChange}
                  className={`w-full p-2 rounded border ${
                    modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                  }`}
                  required
                  disabled={!(esAdmin || esDocente)}
                />
              </div>

              {/* Estado */}
              {esAdmin && (
                <div>
                  <label className="block mb-1 font-semibold">Estado</label>
                  <select
                    name="idEstado"
                    value={form.idEstado}
                    onChange={handleChange}
                    className={`w-full p-2 rounded border ${
                      modoOscuro ? "bg-gray-800 border-gray-600 text-gray-200" : "bg-white border-gray-300"
                    }`}
                    required
                  >
                    {estados.map((e) => (
                      <option key={e.idEstado} value={e.idEstado}>
                        {e.nombreEstado}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                {(esAdmin || esDocente) && (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {modoEdicion ? "Actualizar" : "Guardar"}
                  </button>
                )}
              </div>
            </form>
          </FormularioBase>
        </ModalBase>
      )}
    </div>
  );
};

export default FrmCalificaciones;
