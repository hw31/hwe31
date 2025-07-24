import React, { useEffect, useState } from "react";
import transaccionRolService from "./services/TransaccionxRol";

const FrmTransaccionesPorRol = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [idBuscar, setIdBuscar] = useState("");
  const [idRolBuscar, setIdRolBuscar] = useState("");
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const cargarTransacciones = async () => {
    setLoading(true);
    try {
      const res = await transaccionRolService.listarTransaccionesPorRol();
      setTransacciones(res || []);
      setError("");
    } catch {
      setError("Error al listar transacciones por rol.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  const buscarPorId = async () => {
    if (!idBuscar.trim()) return;
    try {
      const res = await transaccionRolService.filtrarPorIdTransaccionRol(idBuscar.trim());
      setDetalle(res?.Resultado || res);
      setError(res?.Mensaje || "");
    } catch {
      setError("No se pudo obtener la transacción por ID.");
      setDetalle(null);
    }
  };

  const buscarPorRol = async () => {
    if (!idRolBuscar.trim()) return;
    try {
      const res = await transaccionRolService.filtrarPorRol(idRolBuscar.trim());
      setTransacciones(res?.Resultado || res);
      setError(res?.Mensaje || "");
    } catch {
      setError("No se pudo filtrar por rol.");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Transacciones por Rol</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Buscar por ID"
          value={idBuscar}
          onChange={(e) => setIdBuscar(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        />
        <button onClick={buscarPorId}>Buscar ID</button>

        <input
          placeholder="Buscar por Rol"
          value={idRolBuscar}
          onChange={(e) => setIdRolBuscar(e.target.value)}
          style={{ padding: 6, marginLeft: 20, marginRight: 10 }}
        />
        <button onClick={buscarPorRol}>Buscar Rol</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {detalle && (
        <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
          <h4>Detalle Transacción por Rol</h4>
          <p><strong>ID Transacción Rol:</strong> {detalle.idTransaccionRol}</p>
          <p><strong>ID Transacción:</strong> {detalle.idTransaccion}</p>
          <p><strong>ID Rol:</strong> {detalle.idRol}</p>
          <p><strong>Estado:</strong> {detalle.estado}</p>
        </div>
      )}

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }} border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Transacción</th>
              <th>ID Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => (
              <tr key={t.idTransaccionRol}>
                <td>{t.idTransaccionRol}</td>
                <td>{t.idTransaccion}</td>
                <td>{t.idRol}</td>
                <td>{t.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FrmTransaccionesPorRol;
