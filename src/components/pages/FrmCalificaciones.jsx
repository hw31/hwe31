import React from "react";
import { useSelector } from "react-redux";
import calificacionesService from "../../services/Calificaciones";
import usuarioService from "../../services/Usuario"; // nombres docentes
import materiaService from "../../services/Materias";
import tipoCalificacionService from "../../services/TipoCalificacion";
import estadoService from "../../services/Estado";
import inscripcionService from "../../services/Inscripcion";
import inscripcionMateriaService from "../../services/InscricipcionesxMateria";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Swal from "sweetalert2";

const FrmCalificaciones = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const rol = useSelector((state) => state.auth.rol);
  const rolLower = rol?.toLowerCase() || "";
  const idUsuario = useSelector((state) => state.auth.idUsuario);

  const [calificaciones, setCalificaciones] = useState([]);
  const [listas, setListas] = useState({
    docentesMap: {},           // { idUsuario: nombreDocente }
    materiasMap: {},           // { idMateria: nombreMateria }
    tiposCalificacionMap: {},  // { idTipoCalificacion: nombreTipo }
    estadosMap: {},            // { idEstado: nombreEstado }
    estudiantesInscritosPorMateria: {}, // { idMateria: [{idInscripcion, nombreEstudiante}, ...] }
  });

  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar todos los datos en paralelo
        const [
          califResp,
          inscripcionesMateriaResp,
          materiasResp,
          tiposCalificacionResp,
          estadosResp,
          usuariosResp,
          inscripcionesResp,
        ] = await Promise.all([
          calificacionesService.listarCalificacion(),
          inscripcionMateriaService.listarInscripcionesMaterias(),
          materiaService.listarMaterias(),
          tipoCalificacionService.listarTiposCalificacion(),
          estadoService.listarEstados(),
          usuarioService.listarUsuario(),
          inscripcionService.listarInscripciones(),
        ]);

        const calificacionesRaw = califResp.data || [];
        const inscripcionesMateria = inscripcionesMateriaResp.data || [];
        const materias = materiasResp.resultado || [];
        const tiposCalificacion = tiposCalificacionResp.resultado || [];
        const estados = estadosResp.data || [];
        const usuarios = usuariosResp.data || [];
        const inscripciones = inscripcionesResp.data || [];

        // Crear mapas para acceso rápido
        const docentesMap = {};
        usuarios.forEach((u) => {
          docentesMap[Number(u.id_Usuario)] = u.persona;
        });

        const materiasMap = {};
        materias.forEach((m) => {
          materiasMap[Number(m.idMateria)] = m.nombreMateria;
        });

        const tiposCalificacionMap = {};
        tiposCalificacion.forEach((tc) => {
          tiposCalificacionMap[Number(tc.idTipoCalificacion)] = tc.tipoCalificacionNombre;
        });

        const estadosMap = {};
        estados.forEach((e) => {
          estadosMap[Number(e.id_Estado ?? e.idEstado)] = e.nombreEstado ?? e.nombre_Estado;
        });

        // Map de inscripciones para nombre de estudiante
        const inscripcionesMap = {};
        inscripciones.forEach((ins) => {
          inscripcionesMap[Number(ins.id_Inscripcion)] = `${ins.nombre} ${ins.apellido}`;
        });

        // Estudiantes inscritos por materia
        const estudiantesInscritosPorMateria = {};
        inscripcionesMateria.forEach((im) => {
          const idMat = Number(im.id_Materia);
          if (!estudiantesInscritosPorMateria[idMat]) {
            estudiantesInscritosPorMateria[idMat] = [];
          }
          estudiantesInscritosPorMateria[idMat].push({
            idInscripcion: Number(im.id_Inscripcion),
            nombreEstudiante: inscripcionesMap[Number(im.id_Inscripcion)] || "Desconocido",
          });
        });

        // Filtrar calificaciones si es docente para mostrar solo las suyas
        let listaCalificaciones = calificacionesRaw;
        if (rolLower === "docente") {
          listaCalificaciones = listaCalificaciones.filter(
            (c) => Number(c.idUsuarioDocente) === Number(idUsuario)
          );
        }

        setCalificaciones(listaCalificaciones);
        setListas({
          docentesMap,
          materiasMap,
          tiposCalificacionMap,
          estadosMap,
          estudiantesInscritosPorMateria,
        });
        setError("");
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err?.message || "Error desconocido");
        Swal.fire({
          icon: "error",
          title: "Error al cargar datos",
          text: err?.message || "Error desconocido",
        });
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [rolLower, idUsuario]);

  // Filtrar calificaciones por búsqueda (nombre estudiante)
  const calificacionesFiltradas = calificaciones.filter((c) =>
    c.nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Estilos básicos (puedes ajustar o usar los tuyos)
  const encabezado = modoOscuro ? "bg-gray-700 text-white" : "bg-gray-200";
  const texto = modoOscuro ? "text-white" : "text-gray-900";

  return (
    <div className={`p-4 ${modoOscuro ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-2xl font-bold mb-4">Gestión de Calificaciones</h2>

      <input
        type="text"
        placeholder="Buscar por estudiante"
        className="border rounded px-3 py-2 mb-4 w-full max-w-md"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Mensajes */}
      {loading && <p>Cargando calificaciones...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <table className="min-w-full border border-gray-300 mb-6">
            <thead className={encabezado}>
              <tr>
                <th className="border border-gray-300 px-2 py-1">ID</th>
                <th className="border border-gray-300 px-2 py-1">Estudiante</th>
                <th className="border border-gray-300 px-2 py-1">Docente</th>
                <th className="border border-gray-300 px-2 py-1">Materia</th>
                <th className="border border-gray-300 px-2 py-1">Tipo</th>
                <th className="border border-gray-300 px-2 py-1">Calificación</th>
                <th className="border border-gray-300 px-2 py-1">Estado</th>
                <th className="border border-gray-300 px-2 py-1">Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {calificacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No se encontraron calificaciones
                  </td>
                </tr>
              ) : (
                calificacionesFiltradas.map((c) => (
                  <tr
                    key={c.idCalificacion}
                    className={modoOscuro ? "bg-gray-800" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {c.idCalificacion}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {c.nombreEstudiante}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {listas.docentesMap[Number(c.idUsuarioDocente)] || "Desconocido"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {listas.materiasMap[Number(c.idMateria)] || "Desconocida"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {listas.tiposCalificacionMap[Number(c.idTipoCalificacion)] || "Desconocido"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {c.calificacion}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {c.estado === "Activo" ? (
                        <FaCheckCircle
                          className="text-green-600 inline"
                          title="Activo"
                        />
                      ) : (
                        <FaTimesCircle
                          className="text-red-600 inline"
                          title="Inactivo"
                        />
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      {new Date(c.fechaRegistro).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mostrar estudiantes inscritos por materia (opcional) */}
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Estudiantes inscritos por materia
            </h3>
            {Object.entries(listas.estudiantesInscritosPorMateria).map(
              ([idMateria, estudiantes]) => (
                <div key={idMateria} className="mb-4">
                  <h4 className="font-semibold">
                    {listas.materiasMap[idMateria] || `Materia ${idMateria}`}
                  </h4>
                  <ul className="list-disc list-inside">
                    {estudiantes.map((est) => (
                      <li key={est.idInscripcion}>{est.nombreEstudiante}</li>
                    ))}
                  </ul>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FrmCalificaciones;