import React, { useEffect, useState, useMemo, useRef } from "react";
import styled from "styled-components";
import transaccionesService from "../../services/Transacciones";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CardContainer = styled.div`
  background-color: ${({ $modoOscuro }) =>
    $modoOscuro ? "rgba(31, 41, 55, 0.9)" : "#fff"};
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#eee" : "#111")};
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  box-shadow: ${({ $modoOscuro }) =>
    $modoOscuro
      ? "0 4px 10px rgba(0,0,0,0.6)"
      : "0 4px 10px rgba(0,0,0,0.12)"};
  width: 100%;
  max-width: 430px;

  display: flex;
  flex-direction: column;
  min-height: 400px;

  margin-left: -95px; /* Mueve a la izquierda en escritorio */

  @media (max-width: 640px) {
    margin-left: auto;  /* Centra en móvil */
    margin-right: auto;
    padding: 1rem;      /* Más espacio interno en móvil */
  }
`;


const ContentWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

const TotalSummaryItem = styled.div`
  background: ${({ $modoOscuro }) =>
    $modoOscuro
      ? "linear-gradient(135deg, #0f0f0fff, #006600, #0f0f0fff)"
      : "linear-gradient(135deg, #a3d977, #d2f39b, #78b432)"};
  box-shadow: inset 0 0 12px
    ${({ $modoOscuro }) =>
      $modoOscuro ? "rgba(0, 102, 0, 0.8)" : "rgba(120, 180, 50, 0.7)"};
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#d3f9d8" : "#2f4f00")};
  font-weight: 700;
  text-shadow: 1px 1px 2px
    ${({ $modoOscuro }) => ($modoOscuro ? "#225522" : "#a6db3f")};
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  flex: 1 1 30%;
  min-width: 100px;
  text-align: center;
`;

const TopUserSummaryItem = styled.div`
  background: ${({ $modoOscuro }) =>
    $modoOscuro
      ? "linear-gradient(135deg, #0b0b0aff, #a17f00, #171717ff)"
      : "linear-gradient(135deg, #ffd966, #fff8c4, #b28704)"};
  box-shadow: inset 0 0 12px
    ${({ $modoOscuro }) =>
      $modoOscuro ? "rgba(255, 214, 77, 0.8)" : "rgba(178, 135, 4, 0.7)"};
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#fffde7" : "#5a4500")};
  font-weight: 700;
  text-shadow: 1px 1px 2px
    ${({ $modoOscuro }) => ($modoOscuro ? "#5a4300" : "#f1d844")};
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  flex: 1 1 30%;
  min-width: 100px;
  text-align: center;
`;

const TipoTransaccionSummaryItem = styled.div`
  background: ${({ $modoOscuro }) =>
    $modoOscuro
      ? "linear-gradient(135deg, #0a0b0bff, #004080, #0a0b0bff)"
      : "linear-gradient(135deg, #8db4e2, #c9d9f8, #5277b5)"};
  box-shadow: inset 0 0 12px
    ${({ $modoOscuro }) =>
      $modoOscuro ? "rgba(0, 102, 204, 0.8)" : "rgba(82, 119, 181, 0.7)"};
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#d4e9ff" : "#1c2f57")};
  font-weight: 700;
  text-shadow: 1px 1px 2px
    ${({ $modoOscuro }) => ($modoOscuro ? "#0b2350" : "#a8b9d6")};
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  flex: 1 1 30%;
  min-width: 100px;
  text-align: center;
`;

const SummaryNumber = styled.p`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const SummaryLabel = styled.p`
  margin: 0.1rem 0 0;
  font-size: 0.75rem;
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#bbb" : "#555")};
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 0.3rem 0;
  border-bottom: 1px solid ${({ $modoOscuro }) => ($modoOscuro ? "#444" : "#ddd")};
  font-size: 0.75rem;
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#eee" : "#222")};
  cursor: default;
`;

const SmallText = styled.span`
  font-size: 0.65rem;
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#aaa" : "#666")};
  display: block;
  margin-top: 0.2rem;
`;
const CollapsibleContent = styled.div`
  max-height: ${({ open, $maxHeight }) => (open ? `${$maxHeight}px` : "0")};
  overflow-y: auto;
  transition: max-height 0.4s ease;
  border-top: ${({ open, $modoOscuro }) => (open ? `1px solid ${$modoOscuro ? "#444" : "#ddd"}` : "none")};
  margin-top: ${({ open }) => (open ? "0.5rem" : "0")};
  border-radius: 0 0 8px 8px;
`;



const ToggleHeader = styled.div`
  user-select: none;
  font-weight: 400;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.8rem 1.4rem;
  color: ${({ $modoOscuro }) => ($modoOscuro ? "#fff" : "#222")};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  background-color: ${({ $modoOscuro }) =>
    $modoOscuro ? "rgba(31, 41, 55, 0.9)" : "#ddd"};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.25s ease;

  &:hover,
  &:focus {
    background-color: ${({ $modoOscuro }) =>
      $modoOscuro ? "rgba(31, 41, 55, 0.9)" : "#ddd"};
    outline: none;
    transform: scale(1.03);
  }
`;

const Icon = styled.span`
  display: inline-block;
  transition: transform 0.3s ease;
  transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
  font-size: 1.1rem;
  user-select: none;
`;

const BAR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function groupByTipoTransaccion(data) {
  return data.reduce((acc, item) => {
    const key = item.tipoTransaccion;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

const CardTransaccionesAvanzado = ({ modoOscuro }) => {
  const [transacciones, setTransacciones] = useState([]);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await transaccionesService.listarTransacciones();
        setTransacciones(data.resultado || []);
      } catch (err) {
        setError("Error cargando transacciones");
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
  }, [open, transacciones]);

  const totalTransacciones = transacciones.length;

  const topUsuarios = useMemo(() => {
    const counts = transacciones.reduce((acc, t) => {
      const usuario = t.usuario || "Desconocido";
      acc[usuario] = (acc[usuario] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transacciones]);

  const dataPorTipo = useMemo(() => {
    const grouped = groupByTipoTransaccion(transacciones);
    return Object.entries(grouped).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }));
  }, [transacciones]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const color = payload[0].color || (modoOscuro ? "#fff" : "#000");
      return (
        <div
          style={{
            padding: "6px 8px",
            color: color,
            fontWeight: "600",
            fontSize: 12,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {`${label}: ${payload[0].value}`}
        </div>
      );
    }
    return null;
  };

  return (
    <CardContainer
      $modoOscuro={modoOscuro}
      role="region"
      aria-label="Reporte avanzado de transacciones"
    >
      <Title>{`Reporte de transacciones`}</Title>

      <ContentWrapper>
        {error && <p>{error}</p>}
        {!error && totalTransacciones === 0 && (
          <p>No hay transacciones registradas.</p>
        )}

        {totalTransacciones > 0 && (
          <>
            <Summary>
              <TotalSummaryItem $modoOscuro={modoOscuro}>
                <SummaryNumber>{totalTransacciones}</SummaryNumber>
                <SummaryLabel $modoOscuro={modoOscuro}>
                  Total transacciones
                </SummaryLabel>
              </TotalSummaryItem>

              <TopUserSummaryItem $modoOscuro={modoOscuro}>
                <SummaryNumber>{topUsuarios[0]?.[1] || 0}</SummaryNumber>
                <SummaryLabel $modoOscuro={modoOscuro}>
                  Transacciones del usuario top
                </SummaryLabel>
                <SmallText $modoOscuro={modoOscuro}>
                  {topUsuarios[0]?.[0] || "N/A"}
                </SmallText>
              </TopUserSummaryItem>

              <TipoTransaccionSummaryItem $modoOscuro={modoOscuro}>
                <SummaryNumber>{dataPorTipo.length}</SummaryNumber>
                <SummaryLabel $modoOscuro={modoOscuro}>
                  Tipos distintos de transacción
                </SummaryLabel>
              </TipoTransaccionSummaryItem>
            </Summary>

            <div
              style={{
                minHeight: "150px",
                marginBottom: 8,
                backgroundColor: modoOscuro
                  ? "rgba(31, 41, 55, 0.9)"
                  : "rgba(255, 255, 255, 0.95)",
                borderRadius: "10px",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataPorTipo}
                  margin={{ top: 3, right: 20, left: 0, bottom: 5 }}
                  barCategoryGap="10%"
                >
                  <XAxis dataKey="tipo" hide />
                  <YAxis
                    stroke={modoOscuro ? "#eee" : "#333"}
                    allowDecimals={false}
                    domain={[0, "dataMax"]}
                    tickCount={6}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" maxBarSize={20}>
                    {dataPorTipo.map(({ tipo }, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ToggleHeader
              $modoOscuro={modoOscuro}
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen((prev) => !prev);
                }
              }}
            >
              Últimas transacciones
              <Icon open={open}>▼</Icon>
            </ToggleHeader>

            <CollapsibleContent
              ref={contentRef}
              $maxHeight={maxHeight}
              open={open}
              $modoOscuro={modoOscuro}
              aria-hidden={!open}
            >

              <List $modoOscuro={modoOscuro} aria-label="Lista de transacciones recientes">
                {transacciones
                  .slice()
                  .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
                  .slice(0, 30)
                  .map(
                    ({
                      idTransacciones,
                      tipoTransaccion,
                      referencia,
                      usuario,
                      fechaCreacion,
                    }) => (
                      <ListItem
                        key={idTransacciones}
                        $modoOscuro={modoOscuro}
                        title={`${tipoTransaccion} - ${referencia}`}
                      >
                        <strong>{tipoTransaccion}</strong>: {referencia}
                        <SmallText>
                          Por <em>{usuario}</em> el{" "}
                          {new Date(fechaCreacion).toLocaleString()}
                        </SmallText>
                      </ListItem>
                    )
                  )}
              </List>
            </CollapsibleContent>
          </>
        )}
      </ContentWrapper>
    </CardContainer>
  );
};

export default CardTransaccionesAvanzado;
