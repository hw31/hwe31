import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import planEstudioService from "../../services/EstudiantesCarreras";
import carreraService from "../../services/Carreras";
import materiaService from "../../services/Materias";

const FrmPlanEstudio = () => {
  const idUsuario = useSelector((state) => state.auth.idUsuario);
  const rol = useSelector((state) => state.auth.rol).toLowerCase();

  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);

  // Cargar carreras según el rol
  useEffect(() => {
    if (rol === "estudiante") {
      planEstudioService.listarTodos(idUsuario).then(setCarreras);
    } else if (rol === "admin") {
      carreraService.listarCarreras().then(setCarreras);
    }
  }, [rol, idUsuario]);

  // Al seleccionar carrera
  const handleSeleccionCarrera = async (idCarrera) => {
    setCarreraSeleccionada(idCarrera);
    try {
      const res = await materiaService.filtrarPorCarrera(idCarrera);
      setMaterias(res.resultado || []);
    } catch (error) {
      setMaterias([]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Plan de Estudio</h2>

      {carreras.length === 0 ? (
        <p>No hay carreras disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {carreras.map((carrera) => (
            <div
              key={carrera.idCarrera || carrera.iD_Carrera}
              onClick={() =>
                handleSeleccionCarrera(carrera.idCarrera || carrera.iD_Carrera)
              }
              className="cursor-pointer border rounded-lg p-4 shadow hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold">
                {carrera.nombreCarrera}
              </h3>
              <p>ID: {carrera.idCarrera || carrera.iD_Carrera}</p>
            </div>
          ))}
        </div>
      )}

      {materias.length > 0 && carreraSeleccionada && (
        <div>
          <h3 className="text-lg font-bold mb-2">
            Materias de la carrera {carreraSeleccionada}
          </h3>
          <ul className="list-disc pl-5">
            {materias.map((m) => (
              <li key={m.idMateria}>{m.nombreMateria}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FrmPlanEstudio;
