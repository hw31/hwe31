// CardInscripcionesConfirmadas.jsx
import React, { useEffect, useState } from "react";
import inscripcionService from "../../services/Inscripcion";
import periodoService from "../../services/PeriodoAcademico";
import Swal from "sweetalert2";
import { ResponsiveBar } from "@nivo/bar";
import { FaCheckCircle } from "react-icons/fa";

const CardInscripcionesConfirmadas = ({ modoOscuro }) => {
  const [totalConfirmadas, setTotalConfirmadas] = useState(0);
  const [totalInscripciones, setTotalInscripciones] = useState(0);
  const [periodoActivo, setPeriodoActivo] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const periodosRes = await periodoService.listarPeriodosAcademicos();
        const periodos = periodosRes.resultado || [];
        const activo = periodos.find((p) => p.activo === true);

        if (!activo) {
          setPeriodoActivo(null);
          setTotalConfirmadas(0);
          setTotalInscripciones(0);
          return;
        }

        setPeriodoActivo(activo);

        const inscripciones = await inscripcionService.listarInscripciones();
        const inscripcionesPeriodo = inscripciones.filter(
          (i) =>
            i.idPeriodoAcademico === activo.idPeriodoAcademico ||
            i.iD_PeriodoAcademico === activo.idPeriodoAcademico
        );

        const confirmadas = inscripcionesPeriodo.filter(
          (i) => i.idEstado === 10 || i.iD_Estado === 10
        );

        setTotalConfirmadas(confirmadas.length);
        setTotalInscripciones(inscripcionesPeriodo.length);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudo cargar la información", "error");
      }
    };

    cargarDatos();
  }, []);

  const porcentaje =
    totalInscripciones > 0
      ? Math.round((totalConfirmadas / totalInscripciones) * 100)
      : 0;

  const data = [
    {
      tipo: "Inscripciones",
      Confirmadas: totalConfirmadas,
      Total: totalInscripciones,
    },
  ];

  const textColor = modoOscuro ? "#ffffff" : "#111111";
  const labelColor = modoOscuro ? "#dddddd" : "#222222";

  return (
    <div
      className={`rounded-2xl shadow-md p-3 mx-auto w-full max-w-sm backdrop-blur-md bg-opacity-80 border transition-colors ${
        modoOscuro
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-900"
      }`}
      style={{
        userSelect: "none",
        backgroundColor: modoOscuro
          ? "rgba(31, 41, 55, 0.9)"
          : "rgba(255, 255, 255, 0.95)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Inscripciones Confirmadas</h3>
        <FaCheckCircle className="text-green-500 text-base" />
      </div>

      <div className="h-40">
        <ResponsiveBar
          data={data}
          layout="vertical"
          keys={["Confirmadas", "Total"]}
          indexBy="tipo"
          margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
          padding={0.25}
          innerPadding={8}
          groupMode="grouped"
          colors={({ id }) =>
            id === "Confirmadas" ? "url(#gradientConfirmadas)" : "url(#gradientTotal)"
          }
          borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
          theme={{
            axis: {
              domain: { line: { stroke: textColor } },
              ticks: {
                line: { stroke: textColor },
                text: { fill: textColor, fontSize: 10 },
              },
              legend: {
                text: { fill: textColor, fontSize: 11 },
              },
            },
            legends: {
              text: { fill: textColor, fontSize: 10 },
            },
            tooltip: {
              container: {
                fontSize: 12,
                fontWeight: "600",
              },
            },
          }}
          axisBottom={{
            tickSize: 3,
            tickPadding: 6,
            tickRotation: 0,
            legend: "Tipo",
            legendPosition: "middle",
            legendOffset: 30,
            format: () => "Inscripciones",
          }}
          axisLeft={{
            tickSize: 3,
            tickPadding: 6,
            tickRotation: 0,
            legend: "Cantidad",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          enableGridY={true}
          enableGridX={false}
          labelSkipWidth={16}
          labelSkipHeight={12}
          labelTextColor={labelColor}
          borderRadius={6}
          defs={[
            {
              id: "gradientConfirmadas",
              type: "linearGradient",
              colors: [
                { offset: 0, color: "#10B981" },
                { offset: 100, color: "#34D399" },
              ],
            },
            {
              id: "gradientTotal",
              type: "linearGradient",
              colors: [
                { offset: 0, color: "#3B82F6" },
                { offset: 100, color: "#60A5FA" },
              ],
            },
          ]}
          fill={[
            { match: { id: "Confirmadas" }, id: "gradientConfirmadas" },
            { match: { id: "Total" }, id: "gradientTotal" },
          ]}
          tooltip={({ id, value, color }) => (
            <div
              style={{
                padding: "6px 12px",
                color: "#fff",
                background: color,
                borderRadius: 4,
                fontWeight: "600",
                fontSize: 12,
              }}
            >
              {id}: {value}
            </div>
          )}
        />
      </div>

      <div className="text-center mt-4 select-none">
        <div className="text-lg font-bold">{porcentaje}%</div>
        <div className={`mt-1 text-sm ${modoOscuro ? "text-gray-300" : "text-gray-500"}`}>
          ({totalConfirmadas} de {totalInscripciones} confirmadas)
        </div>
        <div className="text-xs mt-1 font-medium">
          {periodoActivo ? `Período: ${periodoActivo.nombrePeriodo}` : "Sin período activo"}
        </div>
      </div>
    </div>
  );
};

export default CardInscripcionesConfirmadas;
