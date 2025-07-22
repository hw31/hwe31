import React, { useEffect, useState } from "react";
import UsuarioService from "../../services/Usuario";
import PersonaService from "../../services/Persona";
import EstadoService from "../../services/Estado";
import { FaPlus, FaEdit, FaUser, FaUserCheck, FaUserTimes } from "react-icons/fa";

const FrmUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [estados, setEstados] = useState([]);

  const [form, setForm] = useState({
    idUsuario: null,
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

    let datos;
    if (modoEdicion) {
      datos = {
        idUsuario: form.idUsuario,
        usuario: form.usuario.trim(),
        contrasena: form.contrasena || "",
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
      console.log("Respuesta API:", res);

      if (res.success) {
        alert(
          res.message || (modoEdicion ? "Usuario actualizado." : "Usuario registrado.")
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
      setError(err.message || "Error inesperado al guardar usuario.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();

    // Buscar nombre de estado con clave correcta: iD_Estado
    const estadoNombre =
      estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado || "";

    // Buscar nombre completo persona para mostrar y filtro
    const personaObj = personas.find((p) => p.idPersona === u.id_Persona);
    const nombrePersona = personaObj
      ? `${personaObj.primerNombre} ${personaObj.primerApellido}`
      : "";

    return (
      u.usuario.toLowerCase().includes(texto) ||
      String(u.id_Persona).includes(texto) ||
      String(u.idUsuario ?? u.id_Usuario).includes(texto) ||
      nombrePersona.toLowerCase().includes(texto) ||
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
      contrasena: "",
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

  // Contadores de usuarios por estado
  const countActivos = usuarios.filter(
    (u) =>
      estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado
        ?.toLowerCase() === "activo"
  ).length;

  const countInactivos = usuarios.filter(
    (u) =>
      estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado
        ?.toLowerCase() === "inactivo"
  ).length;

  const countTotal = usuarios.length;

  // Color de texto según modo
  const textColor = isDark ? "#ddd" : "#111";

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "-75px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: textColor,
        backgroundColor: isDark ? "transparent" : "transparent",
        padding: 20,
        borderRadius: 10,
        userSelect: "none",
      }}
    >
      {/* Barra de búsqueda centrada, más delgada y larga */}
      <div style={{ maxWidth: 600, margin: "20px auto 30px", width: "90%" }}>
        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "50%",
            padding: "8px 16px",
            fontSize: 16,
            borderRadius: "9999px",
            border: `1.2px solid ${isDark ? "#444" : "#ccc"}`,
            outline: "none",
            boxShadow: isDark
              ? "inset 0 1px 4px rgba(255,255,255,0.1)"
              : "inset 0 1px 4px rgba(0,0,0,0.1)",
            color: textColor,
            backgroundColor: isDark ? "#222" : "white",
            transition: "border-color 0.3s ease",
            display: "block",
            margin: "0 auto",
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = isDark ? "#90caf9" : "#1976d2")
          }
          onBlur={(e) =>
            (e.target.style.borderColor = isDark ? "#444" : "#ccc")
          }
          aria-label="Buscar usuarios"
        />
      </div>

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
          aria-label={`Usuarios activos: ${countActivos}`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #0c0b0bff,  #084b27 )")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #127f45ff, #0c0b0bff)")
          }
        >
          <FaUserCheck /> Activos
          <div style={{ fontSize: 26, marginLeft: 8 }}>{countActivos}</div>
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
          aria-label={`Usuarios inactivos: ${countInactivos}`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #101010ff, #de1717ff)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #ef5350, #0c0b0bff)")
          }
        >
          <FaUserTimes /> Inactivos
          <div style={{ fontSize: 26, marginLeft: 8 }}>{countInactivos}</div>
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
          aria-label={`Total de usuarios: ${countTotal}`}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #20262dff, #0d47a1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "linear-gradient(135deg, #0960a8ff, #20262dff)")
          }
        >
          <FaUser /> Total
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
          aria-label="Agregar nuevo usuario"
        >
          <FaPlus /> Agregar
        </button>
      </div>

      {/* Tabla */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderRadius: 10,
          overflow: "hidden",
          fontSize: 15,
          color: textColor,
          userSelect: "none",
        }}
        aria-label="Listado de usuarios"
      >
        <thead
          style={{
            color: textColor,
          }}
        >
          <tr>
            {/* <th style={{ padding: "14px 20px", textAlign: "left" }}>ID</th> */}
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
                  color: isDark ? "#999" : "#555",
                  fontStyle: "italic",
                }}
              >
                No se encontraron usuarios.
              </td>
            </tr>
          ) : (
            usuariosFiltrados.map((u) => (
              <tr
                key={u.idUsuario ?? u.id_Usuario}
                style={{
                  cursor: "default",
                  transition: "background-color 0.3s, color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#264b7d"
                    : "#e3f2fd";
                  e.currentTarget.style.color = isDark ? "#eee" : "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = textColor;
                }}
              >
                 {/* <td style={{ padding: "14px 20px" }}>
            {u.idUsuario ?? u.id_Usuario}
          </td> */}
                <td style={{ padding: "14px 20px" }}>{u.usuario}</td>
                <td style={{ padding: "14px 20px" }}>
                  {getNombrePersonaPorId(u.id_Persona)}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  {estados.find((e) => e.iD_Estado === u.id_Estado)?.nombre_Estado ||
                    "-"}
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
                      transition: "background-color 0.3s",
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
                    <FaEdit /> 
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      {/* Modal */}
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
              backgroundColor: isDark ? "#222" : "#fff",
              borderRadius: 15,
              maxWidth: 500,
              width: "100%",
              padding: 25,
              boxShadow: isDark
                ? "0 8px 20px rgba(255,255,255,0.2)"
                : "0 8px 20px rgba(0,0,0,0.2)",
              color: textColor,
              animation: "fadeInScale 0.3s ease forwards",
            }}
          >
            <h3
              id="tituloModal"
              style={{ marginBottom: 20, color: "#1976d2" }}
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
                      backgroundColor: isDark ? "#333" : "#fff",
                      color: textColor,
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
                  type="text"
                  value={form.usuario}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                    outline: "none",
                    backgroundColor: isDark ? "#333" : "#fff",
                    color: textColor,
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
                  Contraseña {modoEdicion ? "(dejar vacía para no cambiar)" : <span style={{color:"red"}}>*</span>}
                </label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={handleChange}
                  autoComplete={modoEdicion ? "new-password" : "current-password"}
                  style={{
                    width: "100%",
                    padding: 10,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1.5px solid ${isDark ? "#444" : "#ccc"}`,
                    outline: "none",
                    backgroundColor: isDark ? "#333" : "#fff",
                    color: textColor,
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
                    backgroundColor: isDark ? "#333" : "#fff",
                    color: textColor,
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

              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 8,
                    border: "1.5px solid #ccc",
                    marginRight: 12,
                    cursor: "pointer",
                    backgroundColor: isDark ? "#333" : "#f5f5f5",
                    color: textColor,
                    fontWeight: "600",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#1976d2",
                    color: "white",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "700",
                  }}
                >
                  {loading ? "Guardando..." : modoEdicion ? "Actualizar" : "Registrar"}
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
