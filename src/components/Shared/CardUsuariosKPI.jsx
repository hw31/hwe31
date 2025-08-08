// CardUsuariosKPI.jsx
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
      className={`rounded-3xl shadow-xl p-6 mx-auto w-full max-w-sm backdrop-blur-md bg-opacity-70 border transition-colors ${
        modoOscuro
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-900"
      }`}
      style={{
        height: "280px",
        userSelect: "none",
        backgroundColor: modoOscuro
          ? "rgba(31, 41, 55, 0.85)"
          : "rgba(255, 255, 255, 0.85)",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouseRotation(0)}
    >
      <h3 className="text-lg font-bold mb-2 text-center">Usuarios Activos</h3>

      <div style={{ height: "calc(100% - 32px)", width: "100%" }}>
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
          innerRadius={0.6}
          padAngle={2}
          cornerRadius={5}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={3}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          enableArcLinkLabels={false}
          arcLabelsSkipAngle={0}
          arcLabelsTextColor={modoOscuro ? "#FFFFFF" : "#111111"}
          arcLabel={(d) => `${d.value}`}
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
          legends={[
            {
              anchor: "bottom",
              direction: "row",
              justify: false,
              translateY: 40,
              itemWidth: 120,
              itemHeight: 18,
              itemTextColor: modoOscuro ? "#FFFFFF" : "#111111",
              symbolSize: 14,
              symbolShape: "circle",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemTextColor: modoOscuro ? "#EEEEEE" : "#000000",
                  },
                },
              ],
            },
          ]}
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
            tooltip: {
              container: {
                color: "#fff",
                fontWeight: "bold",
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
