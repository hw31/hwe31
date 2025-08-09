import React, { useState } from "react";
import Swal from "sweetalert2";

import personaService from "../../services/Persona";
import contactoService from "../../services/Contacto";
import direccionService from "../../services/Direccion";
import tituloService from "../../services/TitulosAcademicos";
import usuarioService from "../../services/Usuario";
import usuariosRolesService from "../../services/UsuariosRoles";
import estudianteCarreraService from "../../services/EstudiantesCarreras";

import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const WizardForm = ({ isOpen, onClose, modoOscuro }) => {
  const [pasoActual, setPasoActual] = useState(1);

  // Estado persona completo según JSON esperado
  const [persona, setPersona] = useState({
    idPersona: 0,
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    generoId: 0,
    tipoDocumentoId: 0,
    numeroDocumento: "",
    nacionalidadId: 0,
    nivelAcademicoId: 0,
    idEstado: 1, // activo por defecto
  });

  // Listas para contactos, direcciones y títulos
  const [contactos, setContactos] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [titulos, setTitulos] = useState([]);

  const [usuario, setUsuario] = useState({
    idUsuario: 0,
    usuario: "",
    password: "",
  });

  const [rolAsignado, setRolAsignado] = useState({
    idUsuarioRol: 0,
    idUsuario: 0,
    idRol: "",
    idEstado: "",
  });

  const [carreraAsignada, setCarreraAsignada] = useState({
    iD_EstudianteCarrera: 0,
    iD_Usuario: 0,
    iD_Carrera: "",
    fecha_Inicio: "",
    fecha_Fin: "",
    iD_Estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const siguientePaso = () => {
    if (pasoActual === 6 && Number(rolAsignado.idRol) !== 3) {
      setPasoActual(8);
    } else {
      setPasoActual((p) => p + 1);
    }
  };

  const anteriorPaso = () => {
    if (pasoActual === 8) {
      setPasoActual(6);
    } else {
      setPasoActual((p) => Math.max(p - 1, 1));
    }
  };

  // Guardar persona ajustado
  const guardarPersona = async () => {
    if (!persona.primerNombre || !persona.primerApellido) {
      setFormError("Primer nombre y primer apellido son obligatorios.");
      return false;
    }
    setLoading(true);
    try {
      let res;
      if (persona.idPersona && persona.idPersona > 0) {
        res = await personaService.actualizarPersona(persona);
      } else {
        res = await personaService.insertarPersona(persona);
      }
      if (res.success || res.numero > 0) {
        setPersona((prev) => ({ ...prev, idPersona: res.numero || prev.idPersona }));
        return true;
      } else {
        setFormError(res.mensaje || "Error al guardar persona.");
        return false;
      }
    } catch (error) {
      setFormError(error.message || "Error inesperado.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Guardar contactos, direcciones, títulos (igual que antes)
  const guardarContactos = async () => {
    setLoading(true);
    try {
      for (const contacto of contactos) {
        const datos = { ...contacto, idPersona: persona.idPersona };
        if (contacto.idContacto && contacto.idContacto > 0) {
          await contactoService.actualizarContacto(datos);
        } else {
          await contactoService.insertarContacto(datos);
        }
      }
      return true;
    } catch (error) {
      setFormError(error.message || "Error guardando contactos.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const guardarDirecciones = async () => {
    setLoading(true);
    try {
      for (const direccion of direcciones) {
        const datos = { ...direccion, idPersona: persona.idPersona };
        if (direccion.iD_Direccion && direccion.iD_Direccion > 0) {
          await direccionService.actualizarDireccion(datos);
        } else {
          await direccionService.insertarDireccion(datos);
        }
      }
      return true;
    } catch (error) {
      setFormError(error.message || "Error guardando direcciones.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const guardarTitulos = async () => {
    setLoading(true);
    try {
      for (const titulo of titulos) {
        const datos = { ...titulo, idPersona: persona.idPersona };
        if (titulo.iD_Titulo && titulo.iD_Titulo > 0) {
          await tituloService.actualizarTituloAcademico(datos);
        } else {
          await tituloService.insertarTituloAcademico(datos);
        }
      }
      return true;
    } catch (error) {
      setFormError(error.message || "Error guardando títulos académicos.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Guardar usuario
  const guardarUsuario = async () => {
    if (!usuario.usuario || !usuario.password) {
      setFormError("Usuario y contraseña son obligatorios.");
      return false;
    }
    setLoading(true);
    try {
      let res;
      if (usuario.idUsuario && usuario.idUsuario > 0) {
        res = await usuarioService.actualizarUsuario(usuario);
      } else {
        res = await usuarioService.insertarUsuario(usuario);
      }
      if (res.success || res.numero > 0) {
        setUsuario((prev) => ({ ...prev, idUsuario: res.numero || prev.idUsuario }));
        return true;
      } else {
        setFormError(res.mensaje || "Error guardando usuario.");
        return false;
      }
    } catch (error) {
      setFormError(error.message || "Error inesperado.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Guardar rol
  const guardarRol = async () => {
    if (!rolAsignado.idUsuario || !rolAsignado.idRol || !rolAsignado.idEstado) {
      setFormError("Debe asignar rol y estado.");
      return false;
    }
    setLoading(true);
    try {
      let res;
      if (rolAsignado.idUsuarioRol && rolAsignado.idUsuarioRol > 0) {
        res = await usuariosRolesService.actualizarUsuarioRol(rolAsignado);
      } else {
        res = await usuariosRolesService.insertarUsuarioRol(rolAsignado);
      }
      if (res.success || res.numero > 0) {
        setRolAsignado((prev) => ({ ...prev, idUsuarioRol: res.numero || prev.idUsuarioRol }));
        return true;
      } else {
        setFormError(res.mensaje || "Error asignando rol.");
        return false;
      }
    } catch (error) {
      setFormError(error.message || "Error inesperado.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Guardar carrera
  const guardarCarrera = async () => {
    if (
      !carreraAsignada.iD_Usuario ||
      !carreraAsignada.iD_Carrera ||
      !carreraAsignada.fecha_Inicio ||
      !carreraAsignada.fecha_Fin ||
      !carreraAsignada.iD_Estado
    ) {
      setFormError("Todos los campos de carrera son obligatorios.");
      return false;
    }
    setLoading(true);
    try {
      let res;
      if (carreraAsignada.iD_EstudianteCarrera && carreraAsignada.iD_EstudianteCarrera > 0) {
        res = await estudianteCarreraService.actualizarEstudianteCarrera(carreraAsignada);
      } else {
        res = await estudianteCarreraService.insertarEstudianteCarrera(carreraAsignada);
      }
      if (res.success || res.numero > 0) {
        setCarreraAsignada((prev) => ({
          ...prev,
          iD_EstudianteCarrera: res.numero || prev.iD_EstudianteCarrera,
        }));
        return true;
      } else {
        setFormError(res.mensaje || "Error asignando carrera.");
        return false;
      }
    } catch (error) {
      setFormError(error.message || "Error inesperado.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSiguiente = async () => {
    setFormError("");
    let exito = true;

    switch (pasoActual) {
      case 1:
        exito = await guardarPersona();
        break;
      case 2:
        exito = await guardarContactos();
        break;
      case 3:
        exito = await guardarDirecciones();
        break;
      case 4:
        exito = await guardarTitulos();
        break;
      case 5:
        exito = await guardarUsuario();
        break;
      case 6:
        exito = await guardarRol();
        break;
      case 7:
        exito = await guardarCarrera();
        break;
      default:
        exito = true;
    }

    if (exito) {
      if (pasoActual === 8) {
        Swal.fire("Éxito", "Todo guardado correctamente.", "success");
        onClose();
        resetForm();
      } else {
        siguientePaso();
      }
    }
  };

  const resetForm = () => {
    setPasoActual(1);
    setPersona({
      idPersona: 0,
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      generoId: 0,
      tipoDocumentoId: 0,
      numeroDocumento: "",
      nacionalidadId: 0,
      nivelAcademicoId: 0,
      idEstado: 1,
    });
    setContactos([]);
    setDirecciones([]);
    setTitulos([]);
    setUsuario({ idUsuario: 0, usuario: "", password: "" });
    setRolAsignado({ idUsuarioRol: 0, idUsuario: 0, idRol: "", idEstado: "" });
    setCarreraAsignada({ iD_EstudianteCarrera: 0, iD_Usuario: 0, iD_Carrera: "", fecha_Inicio: "", fecha_Fin: "", iD_Estado: "" });
    setFormError("");
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <>
            <h3 className="font-semibold text-lg mb-4">Información Persona</h3>

            <label className="block mb-1">Primer Nombre</label>
            <input
              placeholder="Primer Nombre"
              value={persona.primerNombre}
              onChange={(e) => setPersona({ ...persona, primerNombre: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-1">Segundo Nombre</label>
            <input
              placeholder="Segundo Nombre"
              value={persona.segundoNombre}
              onChange={(e) => setPersona({ ...persona, segundoNombre: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-1">Primer Apellido</label>
            <input
              placeholder="Primer Apellido"
              value={persona.primerApellido}
              onChange={(e) => setPersona({ ...persona, primerApellido: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-1">Segundo Apellido</label>
            <input
              placeholder="Segundo Apellido"
              value={persona.segundoApellido}
              onChange={(e) => setPersona({ ...persona, segundoApellido: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-1">Género</label>
            <select
              value={persona.generoId}
              onChange={(e) => setPersona({ ...persona, generoId: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value={0}>Seleccione Género</option>
              <option value={1}>Masculino</option>
              <option value={2}>Femenino</option>
              <option value={3}>Otro</option>
            </select>

            <label className="block mb-1">Tipo Documento</label>
            <select
              value={persona.tipoDocumentoId}
              onChange={(e) => setPersona({ ...persona, tipoDocumentoId: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value={0}>Seleccione Tipo Documento</option>
              <option value={1}>DNI</option>
              <option value={2}>Pasaporte</option>
            </select>

            <label className="block mb-1">Número Documento</label>
            <input
              placeholder="Número Documento"
              value={persona.numeroDocumento}
              onChange={(e) => setPersona({ ...persona, numeroDocumento: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />

            <label className="block mb-1">Nacionalidad</label>
            <select
              value={persona.nacionalidadId}
              onChange={(e) => setPersona({ ...persona, nacionalidadId: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value={0}>Seleccione Nacionalidad</option>
              <option value={1}>Nacionalidad 1</option>
              <option value={2}>Nacionalidad 2</option>
            </select>

            <label className="block mb-1">Nivel Académico</label>
            <select
              value={persona.nivelAcademicoId}
              onChange={(e) => setPersona({ ...persona, nivelAcademicoId: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value={0}>Seleccione Nivel Académico</option>
              <option value={1}>Bachillerato</option>
              <option value={2}>Licenciatura</option>
            </select>

            <label className="block mb-1">Estado</label>
            <select
              value={persona.idEstado}
              onChange={(e) => setPersona({ ...persona, idEstado: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value={0}>Seleccione Estado</option>
              <option value={1}>Activo</option>
              <option value={2}>Inactivo</option>
            </select>
          </>
        );

      case 2:
        return (
          <>
            <h3>Contactos</h3>
            <p>Implementa tu componente contactos aquí</p>
          </>
        );

      case 3:
        return (
          <>
            <h3>Direcciones</h3>
            <p>Implementa tu componente direcciones aquí</p>
          </>
        );

      case 4:
        return (
          <>
            <h3>Títulos Académicos</h3>
            <p>Implementa tu componente títulos académicos aquí</p>
          </>
        );

      case 5:
        return (
          <>
            <h3>Usuario</h3>
            <input
              placeholder="Usuario"
              value={usuario.usuario}
              onChange={(e) => setUsuario({ ...usuario, usuario: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={usuario.password}
              onChange={(e) => setUsuario({ ...usuario, password: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </>
        );

      case 6:
        return (
          <>
            <h3>Asignar Rol</h3>
            <select
              value={rolAsignado.idRol}
              onChange={(e) => setRolAsignado({ ...rolAsignado, idRol: Number(e.target.value), idUsuario: usuario.idUsuario })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">Seleccione Rol</option>
              <option value={1}>Administrador</option>
              <option value={2}>Docente</option>
              <option value={3}>Estudiante</option>
            </select>

            <select
              value={rolAsignado.idEstado}
              onChange={(e) => setRolAsignado({ ...rolAsignado, idEstado: Number(e.target.value), idUsuario: usuario.idUsuario })}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccione Estado</option>
              <option value={1}>Activo</option>
              <option value={2}>Inactivo</option>
            </select>
          </>
        );

      case 7:
        if (Number(rolAsignado.idRol) !== 3) {
          return <p>Este paso se salta si no es estudiante.</p>;
        }
        return (
          <>
            <h3>Asignar Carrera (Estudiante)</h3>
            <input
              type="date"
              value={carreraAsignada.fecha_Inicio}
              onChange={(e) => setCarreraAsignada({ ...carreraAsignada, fecha_Inicio: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />
            <input
              type="date"
              value={carreraAsignada.fecha_Fin}
              onChange={(e) => setCarreraAsignada({ ...carreraAsignada, fecha_Fin: e.target.value })}
              className="w-full p-2 border rounded mb-3"
            />
            <select
              value={carreraAsignada.iD_Carrera}
              onChange={(e) => setCarreraAsignada({ ...carreraAsignada, iD_Carrera: Number(e.target.value) })}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">Seleccione Carrera</option>
              <option value={1}>Carrera 1</option>
              <option value={2}>Carrera 2</option>
            </select>
            <select
              value={carreraAsignada.iD_Estado}
              onChange={(e) => setCarreraAsignada({ ...carreraAsignada, iD_Estado: Number(e.target.value) })}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccione Estado</option>
              <option value={1}>Activo</option>
              <option value={2}>Inactivo</option>
            </select>
          </>
        );

      case 8:
        return <p>Finalizado. Presiona Guardar para terminar.</p>;

      default:
        return null;
    }
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose} modoOscuro={modoOscuro} titulo="Wizard Form">
      <FormularioBase>
        {formError && (
          <div className="mb-3 p-2 text-red-700 bg-red-100 rounded">{formError}</div>
        )}

        {renderPaso()}

        <div className="flex justify-between mt-6">
          <button
            onClick={anteriorPaso}
            disabled={pasoActual === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleSiguiente}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {pasoActual === 8 ? "Guardar" : "Siguiente"}
          </button>
        </div>
      </FormularioBase>
    </ModalBase>
  );
};

export default WizardForm;
