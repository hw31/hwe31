import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import transaccionesService from "../../services/Transacciones";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const CardContainer = styled.div`
  background-color: ${({ modoOscuro }) => (modoOscuro ? "#222" : "#fff")};
  color: ${({ modoOscuro }) => (modoOscuro ? "#eee" : "#111")};
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: ${({ modoOscuro }) =>
    modoOscuro
      ? "0 8px 20px rgba(0,0,0,0.7)"
      : "0 8px 20px rgba(0,0,0,0.15)"};
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const SummaryItem = styled.div`
  background: ${({ modoOscuro }) => (modoOscuro ? "#333" : "#f5f5f5")};
  padding: 1rem 1.5rem;
  border-radius: 8px;
  flex: 1 1 30%;
  min-width: 150px;
  text-align: center;
  box-shadow: inset 0 0 10px
    ${({ modoOscuro }) => (modoOscuro ? "#444" : "#ddd")};
`;

const SummaryNumber = styled.p`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

const SummaryLabel = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: ${({ modoOscuro }) => (modoOscuro ? "#bbb" : "#555")};
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
  max-height: 180px;
  overflow-y: auto;
  border-top: 1px solid ${({ modoOscuro }) => (modoOscuro ? "#444" : "#ddd")};
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid ${({ modoOscuro }) => (modoOscuro ? "#444" : "#ddd")};
  font-size: 0.9rem;
  color: ${({ modoOscuro }) => (modoOscuro ? "#eee" : "#222")};
  cursor: default;
`;

const SmallText = styled.span`
  font-size: 0.8rem;
  color: ${({ modoOscuro }) => (modoOscuro ? "#aaa" : "#666")};
  display: block;
  margin-top: 0.25rem;
`;

function groupByTipoTransaccion(data) {
  return data.reduce((acc, item) => {
    const key = item.tipoTransaccion;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function groupByFecha(data) {
  // Agrupa por fecha (día) formateada yyyy-mm-dd
  return data.reduce((acc, item) => {
    const date = item.fechaCreacion.slice(0, 10); // yyyy-mm-dd
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
}

const CardTransaccionesAvanzado = ({ modoOscuro }) => {
  const [transacciones, setTransacciones] = useState([]);
  const [error, setError] = useState(null);

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

  // Total transacciones
  const totalTransacciones = transacciones.length;

  // Usuarios que más transaccionaron (top 3)
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

  // Datos para gráfico: cantidad por tipo de transacción
  const dataPorTipo = useMemo(() => {
    const grouped = groupByTipoTransaccion(transacciones);
    return Object.entries(grouped).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }));
  }, [transacciones]);

  // Datos para gráfico: cantidad por fecha (últimos 7 días)
  const dataPorFecha = useMemo(() => {
    const grouped = groupByFecha(transacciones);
    // Ordena fechas y toma últimos 7 días
    const fechasOrdenadas = Object.keys(grouped)
      .sort()
      .slice(-7);

    return fechasOrdenadas.map((fecha) => ({
      fecha,
      cantidad: grouped[fecha],
    }));
  }, [transacciones]);

  return (
    <CardContainer modoOscuro={modoOscuro} role="region" aria-label="Reporte avanzado de transacciones">
      <Title>Reporte de transacciones</Title>

      {error && <p>{error}</p>}
      {!error && totalTransacciones === 0 && <p>No hay transacciones registradas.</p>}

      {totalTransacciones > 0 && (
        <>
          <Summary>
            <SummaryItem modoOscuro={modoOscuro}>
              <SummaryNumber>{totalTransacciones}</SummaryNumber>
              <SummaryLabel>Total transacciones</SummaryLabel>
            </SummaryItem>
            <SummaryItem modoOscuro={modoOscuro}>
              <SummaryNumber>{topUsuarios[0]?.[1] || 0}</SummaryNumber>
              <SummaryLabel>Transacciones del usuario top</SummaryLabel>
              <SmallText>{topUsuarios[0]?.[0] || "N/A"}</SmallText>
            </SummaryItem>
            <SummaryItem modoOscuro={modoOscuro}>
              <SummaryNumber>{dataPorTipo.length}</SummaryNumber>
              <SummaryLabel>Tipos distintos de transacción</SummaryLabel>
            </SummaryItem>
          </Summary>

          <div style={{ height: 200, marginBottom: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataPorTipo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={modoOscuro ? "#444" : "#ccc"} />
                <XAxis dataKey="tipo" stroke={modoOscuro ? "#eee" : "#333"} tick={{ fontSize: 12 }} />
                <YAxis stroke={modoOscuro ? "#eee" : "#333"} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: modoOscuro ? "#333" : "#fff",
                    borderRadius: 5,
                    borderColor: modoOscuro ? "#666" : "#ccc",
                  }}
                />
                <Bar dataKey="cantidad" fill={modoOscuro ? "#4f46e5" : "#3b82f6"} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 style={{ marginBottom: 8, textAlign: "center" }}>Últimas transacciones</h3>
          <List modoOscuro={modoOscuro} aria-label="Lista de transacciones recientes">
            {transacciones
              .slice()
              .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
              .slice(0, 8)
              .map(({ idTransacciones, tipoTransaccion, referencia, usuario, fechaCreacion }) => (
                <ListItem key={idTransacciones} modoOscuro={modoOscuro} title={`${tipoTransaccion} - ${referencia}`}>
                  <strong>{tipoTransaccion}</strong>: {referencia}
                  <SmallText>
                    Por <em>{usuario}</em> el {new Date(fechaCreacion).toLocaleString()}
                  </SmallText>
                </ListItem>
              ))}
          </List>
        </>
      )}
    </CardContainer>
  );
};

export default CardTransaccionesAvanzado;
