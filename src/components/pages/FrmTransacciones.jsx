import React, { useState, useEffect } from "react";
import transaccionService from "../../services/Transacciones";

const FrmTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [detalleTransaccion, setDetalleTransaccion] = useState(null);
  const [idBuscar, setIdBuscar] = useState("");

 
  const cargarTransacciones = async () => {
    setLoading(true);
    try {
      const res = await transaccionService.listarTransacciones();
      setTransacciones(res || []);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Error al cargar las transacciones.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  // Buscar por ID
  const buscarPorId = async () => {
    if (!idBuscar.trim()) {
      setErrorMsg("Ingrese un ID válido para buscar.");
      setDetalleTransaccion(null);
      return;
    }
    setErrorMsg(null);
    try {
      const res = await transaccionService.filtrarPorIdTransaccion(idBuscar.trim());
      if (!res || (res.Numero === -1)) {
        setErrorMsg(res?.Mensaje || "Transacción no encontrada.");
        setDetalleTransaccion(null);
      } else {
        setDetalleTransaccion(res.Resultado || res);
      }
    } catch (error) {
      setErrorMsg("Error inesperado al buscar la transacción.");
      setDetalleTransaccion(null);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>Lista de Transacciones</h2>
      {loading ? (
        <p>Cargando transacciones...</p>
      ) : errorMsg ? (
        <p style={{ color: "red" }}>{errorMsg}</p>
      ) : transacciones.length === 0 ? (
        <p>No hay transacciones registradas.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {/* Ajusta estas columnas según la estructura de tus datos */}
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((t) => (
              <tr key={t.idTransaccion || t.IdTransaccion}>
                <td>{t.idTransaccion || t.IdTransaccion}</td>
                <td>{t.nombre || t.Nombre}</td>
                <td>{t.descripcion || t.Descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 40 }}>Buscar Transacción por ID</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Ingrese ID de transacción"
          value={idBuscar}
          onChange={(e) => setIdBuscar(e.target.value)}
          style={{ padding: 8, width: 200, marginRight: 10 }}
        />
        <button onClick={buscarPorId}>Buscar</button>
      </div>

      {detalleTransaccion && (
        <div style={{ border: "1px solid #ccc", padding: 15 }}>
          <h3>Detalle de Transacción</h3>
          {/* Muestra los datos relevantes, ajusta según estructura real */}
          <p><b>ID:</b> {detalleTransaccion.idTransaccion || detalleTransaccion.IdTransaccion}</p>
          <p><b>Nombre:</b> {detalleTransaccion.nombre || detalleTransaccion.Nombre}</p>
          <p><b>Descripción:</b> {detalleTransaccion.descripcion || detalleTransaccion.Descripcion}</p>
        </div>
      )}
    </div>
  );
};

export default FrmTransacciones;
