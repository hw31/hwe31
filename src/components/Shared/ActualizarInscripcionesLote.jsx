import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import periodoService from "../../services/PeriodoAcademico";
import inscripcionService from "../../services/Inscripcion";

const ActualizarInscripcionesLote = ({ onClose, onActualizado }) => {
  const [periodosActivos, setPeriodosActivos] = useState([]);
  const [periodoAntiguo, setPeriodoAntiguo] = useState(null); // Objeto periodo activo actual
  const [nuevoPeriodo, setNuevoPeriodo] = useState(null); // Objeto periodo seleccionado para activar
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        const resPeriodos = await periodoService.listarPeriodosActivos(); // Suponemos que trae todos (activos y no activos)
        if (!resPeriodos || !resPeriodos.resultado) {
          throw new Error("No se obtuvieron periodos académicos");
        }

        // Filtrar solo activos
        const activos = resPeriodos.resultado.filter((p) => p.activo === true);
        setPeriodosActivos(activos);

        // Buscar periodo activo actual: 
        // La idea es que solo haya 1 activo (según tu lógica) o tomar el primero
        const periodoActual = activos.length > 0 ? activos[0] : null;
        setPeriodoAntiguo(periodoActual);

        // Por defecto, nuevoPeriodo sin seleccionar (null)
        setNuevoPeriodo(null);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudieron cargar los periodos activos.", "error");
      }
    };

    cargarPeriodos();
  }, []);

  const handleNuevoPeriodoChange = (e) => {
    const idSeleccionado = parseInt(e.target.value, 10);
    const seleccionado = periodosActivos.find(
      (p) => p.idPeriodoAcademico === idSeleccionado
    );
    setNuevoPeriodo(seleccionado || null);
  };

  const handleActualizarLote = async () => {
    if (!periodoAntiguo) {
      Swal.fire("Error", "No se pudo determinar el periodo actual.", "error");
      return;
    }
    if (!nuevoPeriodo) {
      Swal.fire("Error", "Seleccione un nuevo periodo académico para activar.", "error");
      return;
    }
    if (nuevoPeriodo.idPeriodoAcademico === periodoAntiguo.idPeriodoAcademico) {
      Swal.fire("Error", "El nuevo periodo debe ser diferente al periodo actual.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        IdPeriodoAcademicoAntiguo: periodoAntiguo.idPeriodoAcademico,
        IdPeriodoAcademicoNuevo: nuevoPeriodo.idPeriodoAcademico,
      };

      const res = await inscripcionService.actualizarInscripcionesLote(payload);
      if (res.numero >= 0) {
        Swal.fire("¡Éxito!", "Inscripciones actualizadas correctamente en lote.", "success");
        if (onActualizado) onActualizado();
        onClose();
      } else {
        Swal.fire("Error", res.mensaje || "Error al actualizar inscripciones en lote.", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Error en la actualización por lote.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-actualizar-lote"
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <h2
          id="titulo-modal-actualizar-lote"
          className="text-2xl font-bold mb-4 text-gray-800"
        >
          Actualizar Inscripciones en Lote
        </h2>

        <button
          aria-label="Cerrar modal"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          ×
        </button>

        <div className="mb-4">
          <label
            htmlFor="periodoAntiguo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Periodo Actual (Antiguo)
          </label>
          <input
            type="text"
            id="periodoAntiguo"
            value={periodoAntiguo ? periodoAntiguo.nombrePeriodo : "Cargando..."}
            disabled
            className="w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 cursor-not-allowed text-gray-700"
          />
          <small className="text-sm text-gray-500 mt-1 block">
            Periodo que será reemplazado
          </small>
        </div>

        <div className="mb-4">
          <label
            htmlFor="nuevoPeriodo"
            className="block mb-1 font-semibold text-gray-700"
          >
            Seleccione el Nuevo Periodo Académico
          </label>
          <select
            id="nuevoPeriodo"
            value={nuevoPeriodo ? nuevoPeriodo.idPeriodoAcademico : ""}
            onChange={handleNuevoPeriodoChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              -- Seleccione un periodo --
            </option>
            {periodosActivos
              .filter(
                (p) => !periodoAntiguo || p.idPeriodoAcademico !== periodoAntiguo.idPeriodoAcademico
              )
              .map((p) => (
                <option key={p.idPeriodoAcademico} value={p.idPeriodoAcademico}>
                  {p.nombrePeriodo}
                </option>
              ))}
          </select>
        </div>

        <button
          onClick={handleActualizarLote}
          disabled={loading}
          className={`mt-2 w-full py-2 rounded font-semibold text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          } transition`}
          aria-busy={loading}
        >
          {loading ? "Actualizando Inscripciones..." : "Actualizar Inscripciones en Lote"}
        </button>
      </div>
    </div>
  );
};

export default ActualizarInscripcionesLote;
