import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled, { ThemeProvider } from "styled-components";
import { Eye, EyeOff, Edit2, ArrowLeftCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import fotoPerfilService from "../../services/Profile";
import usuarioService from "../../services/Usuario";
import contactoService from "../../services/Contacto";

import { setFotoPerfilUrl } from "../../features/Profile/profileSlice";


const Container = styled.div`
  max-width: 480px;
  margin: 2rem auto;
  background: ${({ theme }) => (theme.dark ? "#222" : "#fff")};
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  color: ${({ theme }) => (theme.dark ? "#eee" : "#222")};
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 1rem;
  cursor: pointer;
  border-radius: 50%;
  border: 4px solid #4a90e2;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover::after {
    content: "Cambiar foto";
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    color: white;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
`;


const HiddenFileInput = styled.input`
  display: none;
`;

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  display: block;
  width: 100%;
  padding: 0.55rem 2.5rem 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #bbb;
  font-size: 1rem;
`;

const EyeIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #4a90e2;
  user-select: none;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-bottom: 1.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #a1c1f1;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
`;

const SmallText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

// Contact item card
const ContactItem = styled.div`
  background: ${({ theme }) => (theme.dark ? "#333" : "#f9f9f9")};
  border-radius: 8px;
  padding: 0.7rem 1rem;
  margin-bottom: 0.8rem;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => (theme.dark ? "#444" : "#e6f0ff")};
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  }
`;

const ContactText = styled.div`
  font-size: 1rem;
  word-break: break-word;
`;

const EditIcon = styled.div`
  cursor: pointer;
  color: #4a90e2;
  &:hover {
    color: #357abd;
  }
`;
const PlaceholderAvatar = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid #4a90e2;
  background-color: #4a90e2;
  color: white;
  font-size: 64px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  cursor: pointer;
  position: relative;

  &:hover::after {
    content: "Cambiar foto";
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    color: white;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
  }
`;
const PerfilUsuario = () => {
  const dispatch = useDispatch();

  const { idUsuario, usuario, persona } = useSelector((state) => state.auth || {});
  const idPersona = useSelector(state => state.auth?.idPersona);
  console.log('Usuario actual:', { idUsuario, usuario, persona });
  const modoOscuro = useSelector((state) => (state.theme ? state.theme.modoOscuro : false));

  const [fotoUrl, setFotoUrl] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imgError, setImgError] = useState(false); // Para fallback avatar

  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [contactos, setContactos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [valorEditado, setValorEditado] = useState("");

  const fileInputRef = useRef();

  useEffect(() => {
  if (!idUsuario) return;

  fotoPerfilService.obtenerMiFoto(idUsuario)
    .then((res) => {
      if (res.success && res.ruta) {
        setFotoUrl(`http://localhost:5292${res.ruta}`);
        setImgError(false);
      } else {
        setFotoUrl(null);
        setImgError(true);
      }
    })
    .catch(() => {
      setFotoUrl(null);
      setImgError(true);
    });
}, [idUsuario]);

useEffect(() => {
  console.log("idPersona en useEffect contactos:", idPersona);
  if (!idPersona) return;

  contactoService.filtrarPorIdPersonaContacto(idPersona)
    .then(({ success, data }) => {
      console.log("Respuesta contactoService:", { success, data });
      if (success && Array.isArray(data)) {
        setContactos(data);
      } else {
        setContactos([]);
      }
    })
    .catch((err) => {
      console.error("Error en contactoService:", err);
      setContactos([]);
    });
}, [idPersona]);

  const handleFotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  const handleSubirFoto = async () => {
    if (!fotoFile) return;
    try {
      const res = await fotoPerfilService.subirFoto(fotoFile);
      const nuevaRuta = `http://localhost:5292${res.Ruta || res.ruta}`;

      toast.success("📷 Foto de perfil actualizada con éxito");
      setPreviewUrl(null);
      setFotoFile(null);
      setFotoUrl(nuevaRuta);
      setImgError(false);

      // Actualizamos la foto en Redux para reflejar inmediatamente el cambio
      dispatch(setFotoPerfilUrl(nuevaRuta));
    } catch {
      toast.error("❌ Error al subir la foto");
    }
  };

  useEffect(() => {
    setMostrarConfirmacion(contrasena.length > 0);
    if (contrasena.length === 0) {
      setConfirmarContrasena("");
    }
  }, [contrasena]);

  const contrasenaValida = contrasena.trim().length >= 8;
  const confirmacionValida = confirmarContrasena.trim().length >= 8 && contrasena.trim() === confirmarContrasena.trim();

  const handleActualizarContrasena = async () => {
    if (!contrasenaValida) {
      toast.warn("⚠️ La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!confirmacionValida) {
      toast.warn("⚠️ Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await usuarioService.actualizarContrasenaUsuario({
        nuevaContrasena: contrasena,
      });
      toast.success(res.mensaje || "🔑 Contraseña actualizada con éxito");
      setContrasena("");
      setConfirmarContrasena("");
    } catch (error) {
      const msg =
        error?.mensaje ||
        error?.Mensaje ||
        error?.error ||
        "❌ Error al actualizar la contraseña";
      toast.error(msg);
    }
  };

  const iniciarEdicion = (contacto) => {
    if (contacto.idTipoContacto === 23) return; // no editable
    setEditandoId(contacto.idContacto);
    setValorEditado(contacto.valorContacto);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setValorEditado("");
  };

  const guardarContactoEditado = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!valorEditado.trim()) {
      toast.warn("⚠️ Debe ingresar un contacto válido");
      return;
    }

    try {
      await contactoService.actualizarContacto({
        idContacto: editandoId,
        idPersona: idPersona,
        idTipoContacto: contactos.find(c => c.idContacto === editandoId)?.idTipoContacto || 1,
        valorContacto: valorEditado.trim(),
        idEstado: 1,
      });

      toast.success("📞 Contacto actualizado con éxito");

      setContactos((prev) =>
        prev.map((c) =>
          c.idContacto === editandoId ? { ...c, valorContacto: valorEditado.trim() } : c
        )
      );

      cancelarEdicion();
    } catch (error) {
      console.error("Error al actualizar contacto:", error);
      const mensajeBackend =
        error.response?.data?.mensaje || error.response?.data?.message || "Error desconocido";
      toast.error(`❌ ${mensajeBackend}`);
      cancelarEdicion();
    }
  };
   const navigate = useNavigate();
  const handleVolver = () => {
    navigate("/dashboard/aulas"); // Ajusta la ruta aquí
  };
  return (
     <>
      <style>{`
        /* Estilos para el botón flotante */
        .btn-volver {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: ${modoOscuro ? "#334155" : "#f3f4f6"};
          color: ${modoOscuro ? "#a5f3fc" : "#2563eb"};
          border: none;
          border-radius: 50%;
          padding: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          z-index: 1000;
        }
        .btn-volver:hover {
          background-color: ${modoOscuro ? "#475569" : "#60a5fa"};
          color: white;
        }
      `}</style>
    <ThemeProvider theme={{ dark: modoOscuro }}>
      <Container>
        <Title>Perfil de {persona || usuario}</Title>

        <ProfileImageWrapper onClick={handleFotoClick} title="Haz click para cambiar la foto">
          {(!previewUrl && !fotoUrl) || imgError ? (
            <PlaceholderAvatar onClick={handleFotoClick}>
              {(persona && persona.length > 0
                ? persona.trim().charAt(0).toUpperCase()
                : "U"
              )}
            </PlaceholderAvatar>
          ) : (
            <ProfileImage
              src={previewUrl || fotoUrl}
              alt="Foto de perfil"
              onError={() => setImgError(true)}
            />
          )}
        </ProfileImageWrapper>
        <HiddenFileInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFotoChange}
        />
        {previewUrl && (
          <Button onClick={handleSubirFoto}>Guardar Foto</Button>
        )}

        <Label htmlFor="password">Nueva Contraseña</Label>
        <InputWrapper>
          <Input
            id="password"
            type={mostrarContrasena ? "text" : "password"}
            placeholder="Escribe una nueva contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value.trimStart())}
            autoComplete="new-password"
          />
          <EyeIcon onClick={() => setMostrarContrasena(v => !v)}>
            {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
          </EyeIcon>
        </InputWrapper>
        {contrasena.length > 0 && contrasena.length < 8 && (
          <SmallText style={{ color: "red", marginTop: "-0.8rem", marginBottom: "1rem" }}>
            Debe contener al menos 8 dígitos
          </SmallText>
        )}
        {mostrarConfirmacion && (
          <>
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <InputWrapper>
              <Input
                id="confirm-password"
                type={mostrarConfirmarContrasena ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                autoComplete="new-password"
              />
              <EyeIcon onClick={() => setMostrarConfirmarContrasena(v => !v)}>
                {mostrarConfirmarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
              </EyeIcon>
            </InputWrapper>
            <Button
              onClick={handleActualizarContrasena}
              disabled={!contrasenaValida || !confirmacionValida}
            >
              Guardar Contraseña
            </Button>
          </>
        )}

        <Label>Contactos</Label>
        {contactos.length === 0 ? (
          <SmallText>No tienes contactos registrados.</SmallText>
        ) : (
          contactos.map((contacto) => (
            <ContactItem key={contacto.idContacto}>
              {editandoId === contacto.idContacto ? (
                <>
                  <Input
                    type="text"
                    value={valorEditado}
                    onChange={(e) => setValorEditado(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <Button type="button" onClick={guardarContactoEditado}>Guardar</Button>
                    <Button
                      type="button"
                      onClick={cancelarEdicion}
                      style={{ backgroundColor: "#aaa" }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>
                      {contacto.tipoContacto}
                      {contacto.idTipoContacto === 23 && " (No editable)"}
                    </strong>
                    {contacto.idTipoContacto !== 23 && (
                      <EditIcon onClick={() => iniciarEdicion(contacto)}>
                        <Edit2 size={20} />
                      </EditIcon>
                    )}
                  </div>
                  <ContactText>{contacto.valorContacto}</ContactText>
                </>
              )}
            </ContactItem>
          ))
        )}

        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      </Container>
    </ThemeProvider>
     {/* Botón flotante volver */}
      <button
        className="btn-volver"
        onClick={handleVolver}
        aria-label="Volver"
        title="Volver"
      >
        <ArrowLeftCircle size={24} />
      </button>
    </>
  );
};

export default PerfilUsuario;
