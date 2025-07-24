import React, { useState, useEffect } from "react";
import transaccionPermisoService from "./services/TransaccionesPermiso";

const FrmTransaccionesPermisos = () => {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [idBuscar, setIdBuscar] = useState("");
  const [permisoDetalle, setPermisoDetalle] = useState(null);

  // Cargar lista de permisos al inicio
  const cargarPermisos = async () => {
    setLoading(true);
    try {
      const res = await transaccionPermisoService.listarTransaccionesPermisos();
      setPermisos(res || []);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Error al cargar permisos de transacciones.");
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarPermisos();
  }, []);

  // Buscar permiso por ID
  const buscarPorId = async () => {
    if (!idBuscar.trim()) {
      setErrorMsg("Ingrese un ID válido para buscar.");
      setPermisoDetalle(null);
      return;
    }
    setErrorMsg(null);
    try {
      const res = await transaccionPermisoService.filtrarPorIdTransaccionPermiso(idBuscar.trim());
      if (!res || res.Numero === -1) {
        setErrorMsg(res?.Mensaje || "Permiso no encontrado.");
        setPermisoDetalle(null);
      } else {
        setPermisoDetalle(res.Resultado || res);
      }
    } catch (error) {
      setErrorMsg("Error inesperado al buscar el permiso.");
      setPermisoDetalle(null);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>Permisos de Transacciones</h2>

      {loading ? (
        <p>Cargando permisos...</p>
      ) : errorMsg ? (
        <p style={{ color: "red" }}>{errorMsg}</p>
      ) : permisos.length === 0 ? (
        <p>No hay permisos registrados.</p>
      ) : (
        <table
          style={{ width: "100%", borderCollapse: "collapse" }}
          border="1"
          cellPadding="8"
        >
          <thead>
            <tr>
              {/* Ajusta columnas según estructura real */}
              <th>ID Permiso</th>
              <th>ID Transacción</th>
              <th>ID Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {permisos.map((p) => (
              <tr key={p.idTransaccionPermiso || p.IdTransaccionPermiso}>
                <td>{p.idTransaccionPermiso || p.IdTransaccionPermiso}</td>
                <td>{p.idTransaccion || p.IdTransaccion}</td>
                <td>{p.idRol || p.IdRol}</td>
                <td>{p.estado || p.Estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 30 }}>Buscar Permiso por ID</h3>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Ingrese ID permiso"
          value={idBuscar}
          onChange={(e) => setIdBuscar(e.target.value)}
          style={{ padding: 8, width: 200, marginRight: 10 }}
        />
        <button onClick={buscarPorId}>Buscar</button>
      </div>

      {permisoDetalle && (
        <div style={{ border: "1px solid #ccc", padding: 15 }}>
          <h4>Detalle del Permiso</h4>
          <p><strong>ID Permiso:</strong> {permisoDetalle.idTransaccionPermiso || permisoDetalle.IdTransaccionPermiso}</p>
          <p><strong>ID Transacción:</strong> {permisoDetalle.idTransaccion || permisoDetalle.IdTransaccion}</p>
          <p><strong>ID Rol:</strong> {permisoDetalle.idRol || permisoDetalle.IdRol}</p>
          <p><strong>Estado:</strong> {permisoDetalle.estado || permisoDetalle.Estado}</p>
        </div>
      )}
    </div>
  );
};

export default FrmTransaccionesPermisos;
