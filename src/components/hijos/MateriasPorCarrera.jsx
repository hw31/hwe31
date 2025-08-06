import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { filtrarPorCarrera } from "../../services/Materias"; // ajusta la ruta si es diferente
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const MateriasPorCarrera = () => {
  const { idCarrera } = useParams();
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-white" : "text-gray-900";

  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarMaterias();
  }, [idCarrera]);

  const cargarMaterias = async () => {
    setLoading(true);
    try {
      const res = await filtrarPorCarrera(idCarrera);
      setMaterias(Array.isArray(res) ? res : []);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las materias", "error");
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 min-h-screen ${fondo} ${texto}`}>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Materias de la Carrera #{idCarrera}
      </h2>

      {loading ? (
        <p className="text-center">Cargando materias...</p>
      ) : materias.length === 0 ? (
        <p className="text-center">No hay materias disponibles para esta carrera.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg overflow-hidden">
            <thead className={modoOscuro ? "bg-gray-800" : "bg-gray-200"}>
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Activo</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia, index) => (
                <tr key={materia.iD_Materia} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{materia.nombreMateria}</td>
                  <td className="px-4 py-2">{materia.codigoMateria}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`font-semibold ${
                        materia.activo ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {materia.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MateriasPorCarrera;