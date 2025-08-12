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

  return (
    <>
      <style>{`
  .card-inscripciones {
    user-select: none;
    min-height: 220px;
    max-height: 220px;
    width: 100%;
     max-width: none; /* sin límite */
    margin: 0; /* quitar centrado para que ocupe todo el ancho */
    display: flex;
    position: relative;
    right: 0;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--bg-color);
    transition: right 0.3s ease;
  }
  @media (max-width: 640px) {
    .card-inscripciones {
      right: 0;
      max-width: 90vw;
      width: 100%;
    }
  }
`}</style>


      <div
        className={`card-inscripciones rounded-2xl shadow-md p-2 sm:p-3 mx-auto border transition-colors overflow-hidden ${
          modoOscuro
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white border-gray-300 text-gray-900"
        }`}
        style={{
          "--bg-color": modoOscuro
            ? "rgba(31, 41, 55, 0.9)"
            : "rgba(255, 255, 255, 0.95)",
        }}
      >
        {/* Título + periodo + porcentaje */}
        <div className="mb-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span>Inscripciones Confirmadas</span>
            <FaCheckCircle className="text-green-500 text-sm" />
          </div>
          <div className="text-[10px] text-gray-400 mt-1 truncate">
            {periodoActivo
              ? `Período: ${periodoActivo.nombrePeriodo}`
              : "Sin período activo"}
          </div>
          <div className="text-[11px] font-bold text-center mt-1">
            {porcentaje}% ({totalConfirmadas} de {totalInscripciones})
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-[120px] sm:h-[135px]">
          <ResponsiveBar
            data={data}
            layout="vertical"
            keys={["Confirmadas", "Total"]}
            indexBy="tipo"
            margin={{ top: 5, bottom: 10, left: 30, right: 5 }}
            padding={0.1}
            innerPadding={5}
            groupMode="grouped"
            colors={({ id }) =>
              id === "Confirmadas"
                ? "url(#gradientConfirmadas)"
                : "url(#gradientTotal)"
            }
            borderColor={{ from: "color", modifiers: [["darker", 1.4]] }}
            theme={{
              axis: {
                domain: { line: { stroke: textColor } },
                ticks: {
                  line: { stroke: textColor },
                  text: { fill: textColor, fontSize: 8 },
                },
              },
              legends: { text: { fill: textColor, fontSize: 8 } },
            }}
            axisBottom={{
              tickSize: 3,
              tickPadding: 4,
              format: () => "",
            }}
            axisLeft={{
              tickSize: 3,
              tickPadding: 4,
            }}
            enableGridY={false}
            enableGridX={false}
            labelSkipWidth={20}
            labelSkipHeight={14}
            labelTextColor={"#fff"}
            borderRadius={4}
            defs={[
              {
                id: "gradientConfirmadas",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "#127f45ff" },
                  { offset: 100, color: "#0c0b0bff" },
                ],
              },
              {
                id: "gradientTotal",
                type: "linearGradient",
                colors: [
                  { offset: 0, color: "#0960a8ff" },
                  { offset: 100, color: "#20262dff" },
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
                  padding: "4px 10px",
                  color: "color",
                  background: color,
                  borderRadius: 4,
                  fontWeight: "600",
                  fontSize: 11,
                }}
              >
                {id}: {value}
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default CardInscripcionesConfirmadas;
