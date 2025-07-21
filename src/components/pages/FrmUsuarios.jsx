import React, { useEffect, useState } from "react";
import UsuarioService from "../../services/Usuario";
import PersonaService from "../../services/Persona";
import EstadoService from "../../services/Estado";
import { FaPlus, FaEdit } from "react-icons/fa";
import getErrorMessage from "../../utils/getErrorMessage";

const FrmUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [estados, setEstados] = useState([]);

  const [form, setForm] = useState({
    idUsuario: null,   // Nota: coincidir con JSON: idUsuario (camelCase)
    id_Persona: "",
    usuario: "",
    contrasena: "",
    id_Estado: "",
  });

  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resPersonas, resEstados, resUsuarios] = await Promise.all([
        PersonaService.listarPersonas(),
        EstadoService.listarEstados(),
        UsuarioService.listarUsuario(),
      ]);
      if (resPersonas.success) setPersonas(resPersonas.data);
      if (resEstados.success) setEstados(resEstados.data);
      if (resUsuarios.success) setUsuarios(resUsuarios.data);
    } catch (err) {
      setError("Error al cargar datos iniciales.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validaciones básicas
    if (!form.id_Persona && !modoEdicion) {
      setError("Por favor, seleccione una Persona.");
      return;
    }
    if (!form.usuario.trim()) {
      setError("Por favor, ingrese un usuario.");
      return;
    }
    if (!modoEdicion && !form.contrasena) {
      setError("La contraseña es obligatoria al crear un usuario.");
      return;
    }
    if (!form.id_Estado) {
      setError("Por favor, seleccione un Estado.");
      return;
    }

    // Prepara el objeto para enviar según modo
    let datos;
    if (modoEdicion) {
      datos = {
        idUsuario: form.idUsuario,
        usuario: form.usuario.trim(),
        contrasena: form.contrasena || "", // vacío si no se cambia
        id_Estado: Number(form.id_Estado),
      };
    } else {
      datos = {
        id_Persona: Number(form.id_Persona),
        usuario: form.usuario.trim(),
        contrasena: form.contrasena,
        id_Estado: Number(form.id_Estado),
      };
    }

    setLoading(true);
    setError("");

    try {
      let res;
      if (modoEdicion) {
        res = await UsuarioService.actualizarUsuario(datos);
      } else {
        res = await UsuarioService.insertarUsuario(datos);
      }
       console.log("Respuesta API:", res);  // <-- Esto te mostrará toda la respuesta

      if (res.success) {
        alert(
          res.message ||
            (modoEdicion ? "Usuario actualizado." : "Usuario registrado.")
        );
        setModalOpen(false);
        setForm({
          idUsuario: null,
          id_Persona: "",
          usuario: "",
          contrasena: "",
          id_Estado: "",
        });
        await fetchData();
      } else {
        setError(res.message || "Error desconocido en la operación.");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Error inesperado al guardar usuario."));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    const estadoNombre =
      estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado || "";
    return (
      u.usuario.toLowerCase().includes(texto) ||
      String(u.id_Persona).includes(texto) ||
      String(u.idUsuario ?? u.id_Usuario).includes(texto) ||
      (u.persona?.toLowerCase().includes(texto) ?? false) ||
      estadoNombre.toLowerCase().includes(texto)
    );
  });

  const getNombrePersonaPorId = (id) => {
    if (!id) return "-";
    const p = personas.find((x) => x.idPersona === id);
    return p ? `${p.primerNombre} ${p.primerApellido}` : "-";
  };

  const abrirEditar = (usuario) => {
    setModoEdicion(true);
    setError("");
    setForm({
      idUsuario: usuario.idUsuario ?? usuario.id_Usuario,
      id_Persona: usuario.id_Persona?.toString() || "",
      usuario: usuario.usuario,
      contrasena: "", // No mostrar contraseña por seguridad
      id_Estado: usuario.id_Estado?.toString() || "",
    });
    setModalOpen(true);
  };

  const abrirAgregar = () => {
    setModoEdicion(false);
    setError("");
    setForm({
      idUsuario: null,
      id_Persona: "",
      usuario: "",
      contrasena: "",
      id_Estado: "",
    });
    setModalOpen(true);
  };

  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: isDark ? "#ddd" : "#222",
        backgroundColor: isDark ? "#121212" : "white",
        padding: 20,
        borderRadius: 10,
        boxShadow: isDark
          ? "0 0 10px rgba(255,255,255,0.1)"
          : "0 5px 15px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#1976d2",
          marginBottom: 25,
          userSelect: "none",
        }}
      >
        Gestión de Usuarios
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Buscar por usuario, ID, persona o estado..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flexGrow: 1,
            minWidth: 250,
            padding: "12px 16px",
            fontSize: 16,
            borderRadius: 8,
            border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
            outline: "none",
            boxShadow: isDark
              ? "inset 0 1px 4px rgba(255,255,255,0.1)"
              : "inset 0 1px 4px rgba(0,0,0,0.1)",
            color: isDark ? "#eee" : "#222",
            backgroundColor: isDark ? "#222" : "white",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = isDark ? "#444" : "#ccc")
          }
        />
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
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            userSelect: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#115293")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1976d2")}
          type="button"
          aria-label="Agregar nuevo usuario"
        >
          <FaPlus /> Agregar Usuario
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: isDark
            ? "0 0 10px rgba(255,255,255,0.1)"
            : "0 5px 15px rgba(0,0,0,0.1)",
          borderRadius: 10,
          overflow: "hidden",
          fontSize: 15,
          backgroundColor: isDark ? "#1e1e1e" : "white",
          color: isDark ? "#ddd" : "#222",
        }}
      >
        <thead
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            userSelect: "none",
          }}
        >
          <tr>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>ID</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Usuario</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Persona</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Estado</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Creador</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Modificador</th>
            <th style={{ padding: "14px 20px", textAlign: "left" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: 20,
                  textAlign: "center",
                  color: isDark ? "#999" : "#999",
                  fontStyle: "italic",
                  userSelect: "none",
                }}
              >
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            usuariosFiltrados.map((u) => (
              <tr
                key={u.idUsuario ?? u.id_Usuario}
                style={{ cursor: "default" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = isDark ? "#264b7d" : "#e3f2fd")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td style={{ padding: "14px 20px" }}>{u.idUsuario ?? u.id_Usuario}</td>
                <td style={{ padding: "14px 20px" }}>{u.usuario}</td>
                <td style={{ padding: "14px 20px" }}>
                  {getNombrePersonaPorId(u.id_Persona)}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado || "-"}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {getNombrePersonaPorId(u.id_Creador)}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {getNombrePersonaPorId(u.id_Modificador)}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button
                    onClick={() => abrirEditar(u)}
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
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#015f8c")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#0288d1")
                    }
                    type="button"
                    aria-label={`Editar usuario ${u.usuario}`}
                  >
                    <FaEdit /> Editar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div
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
          <div
            style={{
              backgroundColor: isDark ? "#222" : "white",
              borderRadius: 15,
              maxWidth: 500,
              width: "100%",
              padding: 25,
              boxShadow: isDark
                ? "0 8px 20px rgba(255,255,255,0.2)"
                : "0 8px 20px rgba(0,0,0,0.2)",
              color: isDark ? "#ddd" : "#222",
              animation: "fadeInScale 0.3s ease forwards",
            }}
          >
            <h3
              id="tituloModal"
              style={{ marginBottom: 20, color: "#1976d2", userSelect: "none" }}
            >
              {modoEdicion ? "Actualizar Usuario" : "Registrar Usuario"}
            </h3>

            {error && (
              <div
                style={{
                  backgroundColor: "#fdecea",
                  color: "#b00020",
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 15,
                  fontWeight: "600",
                  userSelect: "none",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {!modoEdicion && (
                <div style={{ marginBottom: 15 }}>
                  <label
                    htmlFor="id_Persona"
                    style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
                  >
                    Persona <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="id_Persona"
                    name="id_Persona"
                    value={form.id_Persona}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: 10,
                      fontSize: 16,
                      borderRadius: 8,
                      border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                      outline: "none",
                      backgroundColor: isDark ? "#333" : "white",
                      color: isDark ? "#ddd" : "#222",
                      transition: "border-color 0.3s ease",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = isDark ? "#444" : "#ccc")
                    }
                  >
                    <option value="">-- Seleccione --</option>
                    {personas.map((p) => (
                      <option key={p.idPersona} value={p.idPersona}>
                        {p.primerNombre} {p.primerApellido}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: 15 }}>
                <label
                  htmlFor="usuario"
                  style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
                >
                  Usuario <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  value={form.usuario}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                    outline: "none",
                    backgroundColor: isDark ? "#333" : "white",
                    color: isDark ? "#ddd" : "#222",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = isDark ? "#444" : "#ccc")
                  }
                />
              </div>

              <div style={{ marginBottom: 15 }}>
                <label
                  htmlFor="contrasena"
                  style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
                >
                  Contraseña{" "}
                  {modoEdicion ? (
                    "(dejar vacío para no cambiar)"
                  ) : (
                    <span style={{ color: "red" }}>*</span>
                  )}
                </label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={handleChange}
                  autoComplete={modoEdicion ? "new-password" : "off"}
                  placeholder={
                    modoEdicion ? "Ingrese nueva contraseña (opcional)" : ""
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                    outline: "none",
                    backgroundColor: isDark ? "#333" : "white",
                    color: isDark ? "#ddd" : "#222",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = isDark ? "#444" : "#ccc")
                  }
                />
              </div>

              <div style={{ marginBottom: 25 }}>
                <label
                  htmlFor="id_Estado"
                  style={{ display: "block", fontWeight: "600", marginBottom: 6 }}
                >
                  Estado <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  id="id_Estado"
                  name="id_Estado"
                  value={form.id_Estado}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                    outline: "none",
                    backgroundColor: isDark ? "#333" : "white",
                    color: isDark ? "#ddd" : "#222",
                    transition: "border-color 0.3s ease",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = isDark ? "#444" : "#ccc")
                  }
                >
                  <option value="">-- Seleccione --</option>
                  {estados.map((e) => (
                    <option key={e.iD_Estado} value={e.iD_Estado}>
                      {e.nombre_Estado}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#777" : "#999"}`,
                    backgroundColor: isDark ? "#333" : "#eee",
                    color: isDark ? "#ccc" : "#333",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: 15,
                    userSelect: "none",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? "#444" : "#ddd")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDark ? "#333" : "#eee")}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    userSelect: "none",
                    opacity: loading ? 0.7 : 1,
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#115293")}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#1976d2")}
                >
                  {modoEdicion ? (loading ? "Actualizando..." : "Actualizar") : loading ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrmUsuarios;
