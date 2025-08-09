import React, { useEffect, useState, useRef } from "react";
import { ResponsivePie } from "@nivo/pie";
import usuariosRolesService from "../../services/UsuariosRoles";

const CardUsuariosKPI = ({ modoOscuro }) => {
  const [data, setData] = useState([
    { id: "Docentes Activos", label: "Docentes Activos", value: 0, color: "#3B82F6" },
    { id: "Estudiantes Activos", label: "Estudiantes Activos", value: 0, color: "#10B981" },
  ]);

  const [rotation, setRotation] = useState(0);
  const requestRef = useRef();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuariosRoles = await usuariosRolesService.listarUsuariosRoles();
        const docentes = usuariosRoles.filter((u) => u.iD_Rol === 2 && u.id_Estado === 1);
        const estudiantes = usuariosRoles.filter((u) => u.iD_Rol === 3 && u.id_Estado === 1);

        setData([
          { id: "Docentes Activos", label: "Docentes Activos", value: docentes.length, color: "#3B82F6" },
          { id: "Estudiantes Activos", label: "Estudiantes Activos", value: estudiantes.length, color: "#10B981" },
        ]);
      } catch (error) {
        console.error("Error cargando usuarios roles KPI:", error);
      }
    };
    cargarDatos();
  }, []);

  const animate = () => {
    setRotation((prev) => (prev + 0.2) % 360);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const [mouseRotation, setMouseRotation] = useState(0);
  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    setMouseRotation(x * 0.2);
  };

  return (
    <div

  className={`rounded-2xl shadow-md p-2 sm:p-3 mx-auto w-full max-w-xs sm:max-w-sm border transition-colors overflow-hidden
    ${modoOscuro ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"}`}
  
      style={{
        userSelect: "none",
        minHeight: "160px",
        backgroundColor: modoOscuro
          ? "rgba(31, 41, 55, 0.9)"
          : "rgba(255, 255, 255, 0.95)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseRotation(0)}
    >
      {/* Título */}
      <h3 className="text-sm font-semibold mb-3 text-center">Usuarios Activos</h3>

      {/* Leyenda personalizada sin cantidades */}
      <div className="flex justify-around mb-2 select-none">
        {data.map(({ id, label, color }) => (
          <div key={id} className="flex items-center space-x-2">
            <span
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs sm:text-sm">{label}</span>
          </div>
        ))}
      </div>

      {/* Gráfico con cantidad dentro */}
      <div className="h-[90px] sm:h-[140px]">
        <ResponsivePie
          data={data}
          margin={{ top: 5, bottom: 10, left: 30, right: 5 }}
          innerRadius={0.6}
          padAngle={2}
          cornerRadius={5}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={2}
          borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
          enableArcLinkLabels={false}
          arcLabelsSkipAngle={0}
          arcLabelsTextColor={modoOscuro ? "#FFFFFF" : "#111111"}
          arcLabel={(d) => `${d.value}`} // Mostrar cantidad dentro del pastel
          tooltip={({ datum }) => (
            <div
              style={{
                padding: "6px 12px",
                background: datum.data.color,
                color: "#fff",
                borderRadius: 6,
                fontWeight: "700",
                fontSize: 13,
                userSelect: "none",
              }}
            >
              {datum.label}: {datum.value}
            </div>
          )}
          legends={[]} // Sin leyenda predeterminada
          theme={{
            labels: {
              text: {
                fill: modoOscuro ? "#FFFFFF" : "#111111",
                fontWeight: "700",
              },
            },
            legends: {
              text: {
                fill: modoOscuro ? "#FFFFFF" : "#111111",
                fontWeight: "600",
              },
            },
          }}
          animate={true}
          motionConfig="gentle"
          rotation={rotation + mouseRotation}
        />
      </div>
    </div>
  );
};

export default CardUsuariosKPI;
