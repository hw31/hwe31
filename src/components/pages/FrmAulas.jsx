import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import aulaService from "../../services/Aulas";
import EstadoService from "../../services/Estado";
import catalogoService from "../../services/Catalogos";
import Swal from "sweetalert2";

import {
  FaPlus,
  FaEdit,
  FaChalkboard,
  FaCheck,
  FaLock,
} from "react-icons/fa";

const FrmAulas = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);

  const [aulas, setAulas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tiposAula, setTiposAula] = useState([]);

  const [form, setForm] = useState({
    idAula: null,
    nombreAula: "",
    capacidad: "",
    id_TipoAula: "",
    idEstado: "",
  });

  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    fetchData();
    fetchTiposAula();
  }, []);

  const fetchData = async () => {
    try {
      const [resEstados, resAulas] = await Promise.all([
        EstadoService.listarEstados(),
        aulaService.listarAula(),
      ]);
      if (resEstados.success) setEstados(resEstados.data);
      if (resAulas.success) setAulas(resAulas.data);
    } catch (err) {
      setError("Error al cargar datos iniciales.");
      console.error(err);
    }
  };

  const fetchTiposAula = async () => {
    try {
      const res = await catalogoService.filtrarPorTipoCatalogo(5);
      if (res.numero === 0 && Array.isArray(res.resultado)) {
        setTiposAula(res.resultado);
      } else {
        console.error("Error en la estructura:", res);
      }
    } catch (error) {
      console.error("Error al obtener tipos de aula:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const mostrarSnackbar = (msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validaciones
    if (!form.nombreAula.trim()) {
      setError("Por favor, ingrese el nombre del aula.");
      return;
    }
    if (!form.capacidad || isNaN(form.capacidad) || Number(form.capacidad) <= 0) {
      setError("Ingrese una capacidad válida (mayor que 0).");
      return;
    }
    if (!form.id_TipoAula) {
      setError("Seleccione un tipo de aula.");
      return;
    }
    if (!form.idEstado) {
      setError("Seleccione un estado.");
      return;
    }

    setLoading(true);
    setError("");
try {
  let res;
  const datos = modoEdicion
    ? {
        idAula: form.idAula,
        nombreAula: form.nombreAula.trim(),
        capacidad: Number(form.capacidad),
        tipoAula: Number(form.id_TipoAula),
        idEstado: Number(form.idEstado),
      }
    : {
        nombreAula: form.nombreAula.trim(),
        capacidad: Number(form.capacidad),
        tipoAula: Number(form.id_TipoAula),
        idEstado: Number(form.idEstado),
      };

  if (modoEdicion) {
    res = await aulaService.actualizarAula(datos);
  } else {
    res = await aulaService.insertarAula(datos);
  }

  // Verifica si el mensaje indica éxito (ignora números cambiantes)
  const mensaje = (res.mensaje || "").toLowerCase();
  if (mensaje.includes("correctamente") || mensaje.includes("exitosamente") || mensaje.includes("éxito")) {
    setModalOpen(false);
    setForm({
      idAula: null,
      nombreAula: "",
      capacidad: "",
      id_TipoAula: "",
      idEstado: "",
    });

    await fetchData();

    Swal.fire({
      icon: "success",
      title: modoEdicion ? "Aula actualizada" : "Aula registrada",
      text: res.mensaje || "Operación exitosa.",
      timer: 2500,
      showConfirmButton: false,
    });
  } else {
    // Respuesta inválida o error
    Swal.fire({
      icon: "error",
      title: "Error",
      text: res.mensaje || "No se pudo completar la operación.",
    });
  }
} catch (err) {
  console.error(err);
  Swal.fire({
    icon: "error",
    title: "Error inesperado",
    text: err.message || "Ocurrió un problema al procesar la solicitud.",
  });
} finally {
  setLoading(false);
}};
  const abrirEditar = (aula) => {
    setModoEdicion(true);
    setError("");
    setForm({
      idAula: aula.idAula,
      nombreAula: aula.nombreAula,
      capacidad: aula.capacidad,
      id_TipoAula: aula.id_TipoAula.toString(),
      idEstado: aula.idEstado.toString(),
    });
    setModalOpen(true);
  };

  const abrirAgregar = () => {
    setModoEdicion(false);
    setError("");
    setForm({
      idAula: null,
      nombreAula: "",
      capacidad: "",
      id_TipoAula: "",
      idEstado: "",
    });
    setModalOpen(true);
  };

  // Filtrado de aulas según búsqueda
  const aulasFiltradas = aulas.filter((a) => {
    const texto = busqueda.toLowerCase();
    return (
      a.nombreAula.toLowerCase().includes(texto) ||
      a.tipo.toLowerCase().includes(texto) ||
      a.estado.toLowerCase().includes(texto) ||
      String(a.capacidad).includes(texto)
    );
  });

  // Contadores
  const countTotal = aulas.length;
  const countActivas = aulas.filter(
    (a) =>
      estados.find((e) => e.iD_Estado === a.idEstado)?.nombre_Estado.toLowerCase() ===
      "activo"
  ).length;
  const countInactivas = countTotal - countActivas;

  // Función para obtener nombre tipo aula por id
  const getNombreTipo = (id) => {
    const tipo = tiposAula.find((t) => t.idCatalogo.toString() === id.toString());
    return tipo ? tipo.descripcionCatalogo : "";
  };

  // Función para obtener nombre estado por id
  const getNombreEstado = (id) => {
    const estado = estados.find((e) => e.iD_Estado.toString() === id.toString());
    return estado ? estado.nombre_Estado : "";
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Colores y estilos según modo oscuro
  const bg = modoOscuro ? "#121212" : "#fefefe";
  const fg = modoOscuro ? "#ddd" : "#222";

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "20px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: fg,
        backgroundColor: bg,
        padding: 20,
        borderRadius: 12,
        userSelect: "none",
        minHeight: "80vh",
      }}
    >
      {/* Contadores */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
          marginTop: 0,
        }}
      >
<div
  style={{
    background: "linear-gradient(135deg, #127f45ff, #0c0b0bff)",
    color: "white",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(2, 79, 33, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  }}
  aria-label={`Aulas activas: ${countActivas}`}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #0c0b0bff,  #084b27ff)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #127f45ff, #0c0b0bff)")
  }
>
  <FaCheck /> Activas
  <div style={{ fontSize: 26, marginLeft: 8 }}>{countActivas}</div>
</div>

<div
  style={{
    background: "linear-gradient(135deg, #ef5350, #0c0b0bff)",
    color: "white",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(244,67,54,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  }}
  aria-label={`Aulas inactivas: ${countInactivas}`}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #101010ff, #de1717ff)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #ef5350, #0c0b0bff)")
  }
>
  <FaLock /> Inactivas
  <div style={{ fontSize: 26, marginLeft: 8 }}>{countInactivas}</div>
</div>

<div
  style={{
    background: "linear-gradient(135deg, #0960a8ff, #20262dff)",
    color: "white",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: "700",
    fontSize: 18,
    minWidth: 140,
    textAlign: "center",
    boxShadow: "0 3px 8px rgba(25,118,210,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    userSelect: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
  }}
  aria-label={`Total de aulas: ${countTotal}`}
  onMouseEnter={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #20262dff, #0d47a1)")
  }
  onMouseLeave={(e) =>
    (e.currentTarget.style.background =
      "linear-gradient(135deg, #0960a8ff, #20262dff)")
  }
>
  <FaChalkboard /> Total
  <div style={{ fontSize: 26, marginLeft: 8 }}>{countTotal}</div>
</div>
      </div>

      {/* Botón agregar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={abrirAgregar}
          style={{
            backgroundColor: "#1976d2",
            border: "none",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "600",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#115293")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
          type="button"
          aria-label="Agregar nueva aula"
        >
          <FaPlus /> Agregar
        </button>
      </div>

      {/* Buscador */}
      <input
        type="search"
        placeholder="Buscar aulas por nombre, tipo, estado o capacidad..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 25,
          fontSize: 18,
          borderRadius: 12,
          border: `1.5px solid ${modoOscuro ? "#333" : "#ccc"}`,
          color: fg,
          backgroundColor: bg,
          outline: "none",
        }}
        aria-label="Buscar aulas"
      />

      {/* Tabla */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderRadius: 10,
          overflow: "hidden",
          fontSize: 15,
          color: fg,
          userSelect: "none",
          boxShadow: modoOscuro
            ? "0 4px 15px rgba(0,0,0,0.8)"
            : "0 4px 15px rgba(0,0,0,0.1)",
        }}
        aria-label="Listado de aulas"
      >
    <thead style={{ backgroundColor: modoOscuro ? "#272727" : "#e0e0e0", color: modoOscuro ? "#eee" : "#222", fontWeight: "700" }}>
        <tr>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Nombre Aula</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Tipo</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Capacidad</th>
            <th style={{ padding: "14px 20px", textAlign: "center", minWidth: 80 }}>Estado</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Creador</th>        
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Creado</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Modificador</th> 
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Modificado</th> 
            <th style={{ padding: "14px 20px", textAlign: "center", minWidth: 100 }}>Acciones</th>
        </tr>
    </thead>
       <tbody>
  {aulasFiltradas.length === 0 ? (
    <tr>
      <td colSpan={9} style={{ padding: 20, textAlign: "center", color: modoOscuro ? "#999" : "#555", fontStyle: "italic" }}>
        No se encontraron aulas.
      </td>
    </tr>
  ) : (
    aulasFiltradas.map((aula) => {
      const estadoNombre = getNombreEstado(aula.idEstado).toLowerCase();
      return (
        <tr
          key={aula.idAula}
          style={{
            cursor: "default",
            transition: "background-color 0.3s, color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = modoOscuro ? "#264b7d" : "#e3f2fd";
            e.currentTarget.style.color = modoOscuro ? "#eee" : "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = fg;
          }}
        >
          <td style={{ padding: "14px 20px" }}>{aula.nombreAula}</td>
          <td style={{ padding: "14px 20px" }}>{getNombreTipo(aula.id_TipoAula)}</td>
          <td style={{ padding: "14px 20px" }}>{aula.capacidad}</td>
          <td
            style={{
              padding: "14px 20px",
              textAlign: "center",
              userSelect: "none",
              color: estadoNombre === "activo" ? "#43a047" : "#e53935",
            }}
            aria-label={`Estado del aula: ${estadoNombre}`}
          >
            {estadoNombre === "activo" ? <FaCheck size={20} aria-hidden="true" /> : <FaLock size={20} aria-hidden="true" />}
          </td>
           <td style={{ padding: "14px 20px" }}>{aula.creador || "-"}</td>  
          <td style={{ padding: "14px 20px" }}>{formatearFecha(aula.fechaCreacion)}</td>
          <td style={{ padding: "14px 20px" }}>{aula.modificador || "-"}</td>
          <td style={{ padding: "14px 20px" }}>{formatearFecha(aula.fechaModificacion)}</td>
         
          
          <td style={{ padding: "14px 20px", textAlign: "center" }}>
            <button
              onClick={() => abrirEditar(aula)}
              style={{
                backgroundColor: "#0288d1",
                border: "none",
                padding: "8px 14px",
                borderRadius: 8,
                color: "white",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                userSelect: "none",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#015f8c")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0288d1")}
              type="button"
              aria-label={`Editar aula ${aula.nombreAula}`}
            >
              <FaEdit />
            </button>
          </td>
        </tr>
      );
    })
  )}
</tbody>
      </table>

      {/* Modal */}
 {modalOpen && (
  <div
    onClick={() => setModalOpen(false)}
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.35)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: 20,
    }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="tituloModal"
  >
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit}
      style={{
        backgroundColor: modoOscuro ? "#222" : "#fff",
        borderRadius: 15,
        maxWidth: 480,
        width: "100%",
        padding: 20,
        color: modoOscuro ? "#ddd" : "#222",
        boxShadow: modoOscuro
          ? "0 0 30px rgba(0,0,0,0.9)"
          : "0 0 30px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: 10, // Menor espacio entre elementos
        userSelect: "text",
        fontSize: 15,
      }}
    >
      <h2
        id="tituloModal"
        style={{
          margin: 0,
          fontWeight: "700",
          fontSize: 20,
          userSelect: "none",
          textAlign: "center",
        }}
      >
        {modoEdicion ? "Editar Aula" : "Registrar Nueva Aula"}
      </h2>

      <label htmlFor="nombreAula" style={{ fontWeight: "600", fontSize: 14 }}>
        Nombre del Aula
      </label>
      <input
        id="nombreAula"
        name="nombreAula"
        type="text"
        value={form.nombreAula}
        onChange={handleChange}
        placeholder="Ej. Aula 101"
        autoComplete="off"
        style={{
          padding: 10,
          fontSize: 15,
          borderRadius: 8,
          border: `1.3px solid ${modoOscuro ? "#444" : "#ccc"}`,
          backgroundColor: modoOscuro ? "#121212" : "#fff",
          color: modoOscuro ? "#eee" : "#222",
          outline: "none",
        }}
        required
      />

      <label htmlFor="capacidad" style={{ fontWeight: "600", fontSize: 14 }}>
        Capacidad
      </label>
      <input
        id="capacidad"
        name="capacidad"
        type="number"
        min={1}
        value={form.capacidad}
        onChange={handleChange}
        placeholder="Ej. 30"
        style={{
          padding: 10,
          fontSize: 15,
          borderRadius: 8,
          border: `1.3px solid ${modoOscuro ? "#444" : "#ccc"}`,
          backgroundColor: modoOscuro ? "#121212" : "#fff",
          color: modoOscuro ? "#eee" : "#222",
          outline: "none",
        }}
        required
      />

      <label htmlFor="id_TipoAula" style={{ fontWeight: "600", fontSize: 14 }}>
        Tipo de Aula
      </label>
      <select
        id="id_TipoAula"
        name="id_TipoAula"
        value={form.id_TipoAula}
        onChange={handleChange}
        style={{
          padding: 10,
          fontSize: 15,
          borderRadius: 8,
          border: `1.3px solid ${modoOscuro ? "#444" : "#ccc"}`,
          backgroundColor: modoOscuro ? "#121212" : "#fff",
          color: modoOscuro ? "#eee" : "#222",
          outline: "none",
        }}
        required
      >
        <option value="">-- Seleccione un tipo --</option>
        {tiposAula.map((tipo) => (
          <option key={tipo.idCatalogo} value={tipo.idCatalogo}>
            {tipo.descripcionCatalogo}
          </option>
        ))}
      </select>

      <label htmlFor="idEstado" style={{ fontWeight: "600", fontSize: 14 }}>
        Estado
      </label>
      <select
        id="idEstado"
        name="idEstado"
        value={form.idEstado}
        onChange={handleChange}
        style={{
          padding: 10,
          fontSize: 15,
          borderRadius: 8,
          border: `1.3px solid ${modoOscuro ? "#444" : "#ccc"}`,
          backgroundColor: modoOscuro ? "#121212" : "#fff",
          color: modoOscuro ? "#eee" : "#222",
          outline: "none",
        }}
        required
      >
        <option value="">-- Seleccione estado --</option>
        {estados.map((e) => (
          <option key={e.iD_Estado} value={e.iD_Estado}>
            {e.nombre_Estado}
          </option>
        ))}
      </select>

      {error && (
        <p
          role="alert"
          style={{
            color: "crimson",
            fontWeight: "700",
            marginTop: -4,
            marginBottom: 4,
            whiteSpace: "pre-wrap",
            userSelect: "text",
            fontSize: 14,
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 8,
        }}
      >
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: loading ? "#aaa" : "#4caf50",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: "700",
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#45a049";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#4caf50";
          }}
        >
          {modoEdicion ? "Actualizar" : "Registrar"}
        </button>

        <button
          type="button"
          onClick={() => setModalOpen(false)}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: "700",
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#d32f2f";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#f44336";
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
)}

      {/* Snackbar */}
      {snackbar && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#4caf50",
            color: "white",
            padding: "12px 28px",
            borderRadius: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            fontWeight: "600",
            fontSize: 16,
            zIndex: 10000,
            userSelect: "none",
          }}
        >
          {snackbar}
        </div>
      )}
    </div>
  );
};

export default FrmAulas;
