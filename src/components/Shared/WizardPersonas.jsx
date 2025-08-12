import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

import personaCompletaService from '../../services/insertarPersonaCompleta';
import catalogoService from '../../services/Catalogos';
import rolesService from '../../services/Roles';
import carrerasService from '../../services/Carreras';

export default function FormularioCompleto() {
  const { modoOscuro } = useSelector(state => state.theme);
  const { idUsuario } = useSelector(state => state.auth.usuario);

  // Catálogos
  const [generos, setGeneros] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [tiposDireccion, setTiposDireccion] = useState([]);
  const [tiposContacto, setTiposContacto] = useState([]);
  const [nivelesAcademicos, setNivelesAcademicos] = useState([]);
  const [roles, setRoles] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('');

  // Estados formulario
  const [persona, setPersona] = useState({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    generoId: '',
    tipoDocumentoId: '',
    numeroDocumento: '',
    nacionalidadId: '',
    idEstado: 1,
  });

  const [direccion, setDireccion] = useState({
    idTipoDireccion: '',
    detalleDireccion: '',
    codigoPostal: '',
    municipio: '',
    departamento: '',
    referencia: '',
    idEstado: 1,
  });

  const [contactosValores, setContactosValores] = useState({});

  const [titulosPersonales, setTitulosPersonales] = useState([]);

  const [usuario, setUsuario] = useState({
    usuario: '',
    contrasena: '',
    idEstado: 1,
  });

  const [rolUsuario, setRolUsuario] = useState({
    idRol: '',
    idEstado: 1,
  });

  const [estudianteCarrera, setEstudianteCarrera] = useState({
    idCarrera: '',
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString().slice(0, 10),
    idEstado: 1,
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Carga inicial de catálogos y roles
  useEffect(() => {
    async function cargarCatalogos() {
      try {
        const resCatalogo = await catalogoService.listarCatalogo();
        if (resCatalogo && Array.isArray(resCatalogo.resultado)) {
          setGeneros(resCatalogo.resultado.filter(c => c.idTipoCatalogo === 1));
          setTiposDocumento(resCatalogo.resultado.filter(c => c.idTipoCatalogo === 3));
          setNacionalidades(resCatalogo.resultado.filter(c => c.idTipoCatalogo === 2));
        } else {
          Swal.fire("Error", "No se pudo cargar el catálogo general", "error");
        }

        const resDireccion = await catalogoService.filtrarPorTipoCatalogo(9);
        setTiposDireccion(Array.isArray(resDireccion.resultado) ? resDireccion.resultado : []);

        const resContacto = await catalogoService.filtrarPorTipoCatalogo(7);
        setTiposContacto(Array.isArray(resContacto.resultado) ? resContacto.resultado : []);

        const resNivel = await catalogoService.filtrarPorTipoCatalogo(6);
        setNivelesAcademicos(Array.isArray(resNivel.resultado) ? resNivel.resultado : []);

        const resTurnos = await catalogoService.filtrarPorTipoCatalogo(10);
        setTurnos(Array.isArray(resTurnos.resultado) ? resTurnos.resultado : []);

        const resRoles = await rolesService.listarRoles();
        if (resRoles && Array.isArray(resRoles.resultado)) {
          const rolesMapeados = resRoles.resultado
            .filter(r => r.activo)
            .map(r => ({
              id: r.iD_Rol,
              descripcion: r.nombre_Rol,
            }));
          setRoles(rolesMapeados);
        } else {
          Swal.fire("Error", "No se pudo cargar los roles", "error");
        }

        const resCarreras = await carrerasService.listarCarreras();
        if (resCarreras && Array.isArray(resCarreras)) {
          const carrerasAdaptadas = resCarreras.map(c => ({
            id: c.iD_Carrera,
            descripcion: c.nombreCarrera,
            codigoCarrera: c.codigoCarrera,
            activo: c.activo,
          }));
          setCarreras(carrerasAdaptadas);
        } else {
          Swal.fire("Error", "No se pudo cargar las carreras", "error");
        }
      } catch (error) {
        Swal.fire("Error", "Error cargando catálogos: " + (error.message || error), "error");
      }
    }
    cargarCatalogos();
  }, []);

  // Inicializar títulos personales cuando cambian los niveles académicos
  useEffect(() => {
    if (nivelesAcademicos.length > 0) {
      const inicial = nivelesAcademicos.map(t => ({
        idCatalogo: t.idCatalogo,
        descripcion: t.descripcionCatalogo,
        seleccionado: false,
        especialidad: '',
      }));
      setTitulosPersonales(inicial);
    }
  }, [nivelesAcademicos]);

  // Manejadores para títulos
  const toggleSeleccionTitulo = (idCatalogo) => {
    setTitulosPersonales(prev => prev.map(t =>
      t.idCatalogo === idCatalogo
        ? {
          ...t,
          seleccionado: !t.seleccionado,
          especialidad: (!t.seleccionado && idCatalogo === 19) ? 'ninguno' : t.especialidad
        }
        : t
    ));
  };

  const handleEspecialidadChange = (idCatalogo, value) => {
    setTitulosPersonales(prev => prev.map(t =>
      t.idCatalogo === idCatalogo ? { ...t, especialidad: value } : t
    ));
  };

  // Cambio genérico para inputs/select
  const handleChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  // --- Estilos ---
  const formStyle = {
    maxWidth: 900,
    margin: 'auto',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: modoOscuro ? '#121212' : '#fff',
    color: modoOscuro ? '#e0e0e0' : '#000',
    borderRadius: 8,
    boxShadow: modoOscuro ? '0 0 10px #333' : '0 0 10px #ccc',
    display: 'flex',
    flexDirection: 'column',
    gap: 25,
  };

  const fieldsetStyle = {
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: 15,
    backgroundColor: modoOscuro ? '#1e1e1e' : '#fafafa',
  };

  const flexRow = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 10,
  };

  const inputStyle = {
    flex: '1 1 45%',
    padding: 10,
    borderRadius: 4,
    border: '1px solid #ccc',
    backgroundColor: modoOscuro ? '#222' : '#fff',
    color: modoOscuro ? '#eee' : '#000',
    minWidth: 160,
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    minWidth: 180,
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: 5,
  };

  const dateInputWrapper = {
    display: 'flex',
    gap: '10%',
  };

  // --- Fin estilos ---
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Validar campos persona obligatorios
    const {
      primerNombre,
      primerApellido,
      generoId,
      tipoDocumentoId,
      nacionalidadId,
      numeroDocumento,
    } = persona;

    if (
      !primerNombre.trim() ||
      !primerApellido.trim() ||
      !generoId ||
      !tipoDocumentoId ||
      !nacionalidadId ||
      !numeroDocumento.trim()
    ) {
      Swal.fire("Validación", "Complete todos los campos obligatorios de Persona.", "warning");
      return;
    }

    // Validar campos dirección obligatorios
    const {
      idTipoDireccion,
      detalleDireccion,
    } = direccion;

    if (!idTipoDireccion || !detalleDireccion.trim()) {
      Swal.fire("Validación", "Complete todos los campos obligatorios de Dirección.", "warning");
      return;
    }

    // Validar usuario y rol obligatorios
    if (!usuario.usuario.trim() || !usuario.contrasena.trim() || !rolUsuario.idRol) {
      Swal.fire("Validación", "Complete todos los campos obligatorios de Usuario y Rol.", "warning");
      return;
    }

    // Si es estudiante (rol 3), validar campos estudiante-carrera obligatorios
    if (parseInt(rolUsuario.idRol, 10) === 3) {
      if (
        !estudianteCarrera.idCarrera ||
        !turnoSeleccionado ||
        !estudianteCarrera.fechaInicio ||
        !estudianteCarrera.fechaFin
      ) {
        Swal.fire("Validación", "Complete todos los campos obligatorios de Estudiante - Carrera.", "warning");
        return;
      }
    }

    // Validar títulos académicos: al menos uno seleccionado
    const titulosSeleccionados = titulosPersonales.filter(t => t.seleccionado);

    if (titulosSeleccionados.length === 0) {
      Swal.fire("Validación", "Debe seleccionar al menos un título académico.", "warning");
      return;
    }

    // Validar que cada título seleccionado tenga especialidad no vacía
    for (const titulo of titulosSeleccionados) {
      if (!titulo.especialidad || titulo.especialidad.trim() === "") {
        Swal.fire("Validación", `Ingrese especialidad para el título "${titulo.descripcion}".`, "warning");
        return;
      }
    }

    // Preparar contactos filtrando y validando (como tenías)
    const contactos = Object.entries(contactosValores)
      .filter(([idTipoContacto, valor]) => {
        const idNum = Number(idTipoContacto);
        return valor.trim() !== '' && tiposContacto.some(tc => tc.idCatalogo === idNum);
      })
      .map(([idTipoContacto, valor]) => ({
        IdTipoContacto: Number(idTipoContacto),
        ValorContacto: valor.trim(),
        IdEstado: 1,
      }));

    // Construir el objeto personaCompleta (igual que antes)
    const personaCompleta = {
      PrimerNombre: persona.primerNombre.trim(),
      SegundoNombre: persona.segundoNombre.trim() || null,
      PrimerApellido: persona.primerApellido.trim(),
      SegundoApellido: persona.segundoApellido.trim() || null,
      GeneroId: Number(persona.generoId) || null,
      TipoDocumentoId: Number(persona.tipoDocumentoId) || null,
      NumeroDocumento: persona.numeroDocumento.trim() || null,
      NacionalidadId: Number(persona.nacionalidadId) || null,
      EstadoId: Number(persona.idEstado),

      TipoDireccionId: Number(direccion.idTipoDireccion) || null,
      DetalleDireccion: direccion.detalleDireccion || null,
      CodigoPostal: direccion.codigoPostal || null,
      Municipio: direccion.municipio || null,
      Departamento: direccion.departamento || null,
      Referencia: direccion.referencia || null,
      EstadoDireccionId: Number(direccion.idEstado) || null,

      Contactos: contactos,

      Titulos: titulosSeleccionados.map(t => ({
        IdNivelAcademico: t.idCatalogo,
        Especialidad: t.especialidad || null,
        TituloEstado: 1,
      })),

      Usuario: usuario.usuario.trim() || null,
      Contrasena: usuario.contrasena || null,
      EstadoUsuarioId: Number(usuario.idEstado),

      RolId: Number(rolUsuario.idRol) || null,
      EstadoRolId: Number(rolUsuario.idEstado),

      CarreraId: Number(estudianteCarrera.idCarrera) || null,
      FechaInicioCarrera: estudianteCarrera.fechaInicio || null,
      FechaFinCarrera: estudianteCarrera.fechaFin || null,
      EstadoEstudianteCarreraId: Number(estudianteCarrera.idEstado),
    };

    console.log("Objeto enviado:", personaCompleta);

    const respuesta = await personaCompletaService.insertarPersonaCompleta(personaCompleta);

    // Validar mensaje para determinar éxito
    const mensajeMinuscula = (respuesta?.mensaje || '').toLowerCase();
    const esExito = mensajeMinuscula.includes('correctamente') || mensajeMinuscula.includes('exitosamente');

    if (!respuesta || respuesta.numero <= 0 || !esExito) {
      throw new Error(respuesta?.mensaje || "Error al insertar persona completa");
    }

    Swal.fire("Éxito", "Persona y datos relacionados insertados correctamente", "success");

    // Limpiar estados
    setPersona({
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      generoId: '',
      tipoDocumentoId: '',
      numeroDocumento: '',
      nacionalidadId: '',
      idEstado: 1,
    });

    setDireccion({
      idTipoDireccion: '',
      detalleDireccion: '',
      codigoPostal: '',
      municipio: '',
      departamento: '',
      referencia: '',
      idEstado: 1,
    });

    setContactosValores({});

    setTitulosPersonales(titulosPersonales.map(t => ({ ...t, seleccionado: false, especialidad: '' })));

    setUsuario({
      usuario: '',
      contrasena: '',
      idEstado: 1,
    });

    setRolUsuario({
      idRol: '',
      idEstado: 1,
    });

    setEstudianteCarrera({
      idCarrera: '',
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: new Date(new Date().setFullYear(new Date().getFullYear() + 4)).toISOString().slice(0, 10),
      idEstado: 1,
    });

    setTurnoSeleccionado('');

  } catch (error) {
    Swal.fire("Error", error.message || "Error inesperado", "error");
  }
};


  return (
    <form onSubmit={handleSubmit} style={formStyle} noValidate>
      <h1>Nuevo Registro</h1>
     

      {/* Persona */}
      <fieldset style={fieldsetStyle}>
        <legend><strong>Datos Persona</strong></legend>
         <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
          * Campos obligatorios
        </span>
        <div style={flexRow}>
          <input
            required
            name="primerNombre"
            placeholder="Primer Nombre"
            value={persona.primerNombre}
            onChange={e => handleChange(e, setPersona)}
            style={inputStyle}
          />
          <input
            name="segundoNombre"
            placeholder="Segundo Nombre"
            value={persona.segundoNombre}
            onChange={e => handleChange(e, setPersona)}
            style={inputStyle}
          />
        </div>
        <div style={flexRow}>
          <input
            required
            name="primerApellido"
            placeholder="Primer Apellido"
            value={persona.primerApellido}
            onChange={e => handleChange(e, setPersona)}
            style={inputStyle}
          />
          <input
            name="segundoApellido"
            placeholder="Segundo Apellido"
            value={persona.segundoApellido}
            onChange={e => handleChange(e, setPersona)}
            style={inputStyle}
          />
        </div>
        <div style={flexRow}>
          <select
            required
            name="generoId"
            value={persona.generoId}
            onChange={e => handleChange(e, setPersona)}
            style={selectStyle}
          >
            <option value="">Género</option>
            {generos.map(g => (
              <option key={g.idCatalogo} value={g.idCatalogo}>{g.descripcionCatalogo}</option>
            ))}
          </select>
          <select
            required
            name="tipoDocumentoId"
            value={persona.tipoDocumentoId}
            onChange={e => handleChange(e, setPersona)}
            style={selectStyle}
          >
            <option value="">Tipo Documento</option>
            {tiposDocumento.map(t => (
              <option key={t.idCatalogo} value={t.idCatalogo}>{t.descripcionCatalogo}</option>
            ))}
          </select>
        </div>
        <div style={flexRow}>
          <select
            required
            name="nacionalidadId"
            value={persona.nacionalidadId}
            onChange={e => handleChange(e, setPersona)}
            style={selectStyle}
          >
            <option value="">Nacionalidad</option>
            {nacionalidades.map(n => (
              <option key={n.idCatalogo} value={n.idCatalogo}>{n.descripcionCatalogo}</option>
            ))}
          </select>
          <input
            required
            name="numeroDocumento"
            placeholder="Número Documento"
            value={persona.numeroDocumento}
            onChange={e => handleChange(e, setPersona)}
            style={inputStyle}
          />
        </div>
      </fieldset>

      {/* Dirección */}
      <fieldset style={fieldsetStyle}>
        <legend><strong>Dirección</strong></legend>
         <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
          * Campos obligatorios
        </span>
        <div style={flexRow}>
          <select
            required
            name="idTipoDireccion"
            value={direccion.idTipoDireccion}
            onChange={e => handleChange(e, setDireccion)}
            style={selectStyle}
          >
            <option value="">Tipo Dirección</option>
            {tiposDireccion.map(td => (
              <option key={td.idCatalogo} value={td.idCatalogo}>{td.descripcionCatalogo}</option>
            ))}
          </select>
          <input
            required
            name="detalleDireccion"
            placeholder="Detalle Dirección"
            value={direccion.detalleDireccion}
            onChange={e => handleChange(e, setDireccion)}
            style={inputStyle}
          />
        </div>
        <div style={flexRow}>
          <input
            name="codigoPostal"
            placeholder="Código Postal"
            value={direccion.codigoPostal}
            onChange={e => handleChange(e, setDireccion)}
            style={inputStyle}
          />
          <input
            name="municipio"
            placeholder="Municipio"
            value={direccion.municipio}
            onChange={e => handleChange(e, setDireccion)}
            style={inputStyle}
          />
        </div>
        <div style={flexRow}>
          <input
            name="departamento"
            placeholder="Departamento"
            value={direccion.departamento}
            onChange={e => handleChange(e, setDireccion)}
            style={inputStyle}
          />
          <input
            name="referencia"
            placeholder="Referencia"
            value={direccion.referencia}
            onChange={e => handleChange(e, setDireccion)}
            style={{ ...inputStyle, flex: '1 1 100%' }}
          />
        </div>
      </fieldset>

     {/* Contactos */}
<fieldset style={fieldsetStyle}>
  <legend><strong>Contactos</strong></legend>
   <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
      * Campos obligatorios
    </span>
  {tiposContacto.map(tc => {
    const esTelefonoFijo = tc.descripcionCatalogo.toLowerCase().includes('telefono fijo');
    return (
      <div key={tc.idCatalogo} style={flexRow}>
        <label style={{ ...labelStyle, flex: '0 0 180px', alignSelf: 'center' }}>
          {tc.descripcionCatalogo}
          {esTelefonoFijo && <span style={{ fontStyle: 'italic', fontWeight: 'normal', marginLeft: 8, fontSize: 12, color: '#666' }}>
            (opcional)
          </span>}
        </label>
        <input
          type="text"
          placeholder={`Ingrese ${tc.descripcionCatalogo}`}
          value={contactosValores[tc.idCatalogo] || ''}
          onChange={e => setContactosValores(prev => ({
            ...prev,
            [tc.idCatalogo]: e.target.value,
          }))}
          style={{ ...inputStyle, flex: '1 1 auto' }}
          required={!esTelefonoFijo}
        />
      </div>
    );
  })}
</fieldset>

      {/* Títulos Académicos */}
      <fieldset style={fieldsetStyle}>
        <legend><strong>Títulos Académicos</strong></legend>
         <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
        * Debe seleccionar al menos un título y proporcionar una especialidad
      </span>
        {titulosPersonales.map(titulo => (
          <div key={titulo.idCatalogo} style={{ marginBottom: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={titulo.seleccionado}
                onChange={() => toggleSeleccionTitulo(titulo.idCatalogo)}
                style={{ marginRight: 8 }}
              />
              {titulo.descripcion}
            </label>
            {titulo.seleccionado && (
              <div style={{ marginLeft: 24, marginTop: 4 }}>
                <input
                  required={titulo.idCatalogo !== 19}
                  placeholder={`Especialidad para ${titulo.descripcion}`}
                  value={titulo.especialidad}
                  onChange={e => handleEspecialidadChange(titulo.idCatalogo, e.target.value)}
                  style={inputStyle}
                />
                {titulo.idCatalogo === 19 && (
                  <p style={{ fontSize: 12, color: 'orange', marginTop: 4 }}>
                    Para "Bachiller" rellene especialidad con "Ninguno"
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </fieldset>

      {/* Usuario y Rol */}
      <fieldset style={fieldsetStyle}>
        <legend><strong>Usuario y Rol</strong></legend>
         <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
          * Campos obligatorios
        </span>
        <div style={flexRow}>
          <input
            required
            name="usuario"
            placeholder="Usuario"
            value={usuario.usuario}
            onChange={e => handleChange(e, setUsuario)}
            style={inputStyle}
          />
          <input
            required
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={usuario.contrasena}
            onChange={e => handleChange(e, setUsuario)}
            style={inputStyle}
          />
        </div>
        <div style={flexRow}>
          <select
            required
            name="idRol"
            value={rolUsuario.idRol}
            onChange={e => setRolUsuario(prev => ({ ...prev, idRol: e.target.value }))}
            style={selectStyle}
          >
            <option value="">Rol Usuario</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.descripcion}</option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Estudiante-Carrera si rol 3 */}
      {parseInt(rolUsuario.idRol, 10) === 3 && (
        <fieldset style={fieldsetStyle}>
          <legend><strong>Estudiante - Carrera</strong></legend>
             <span style={{ color: 'red', fontSize: 12, fontWeight: 'normal' }}>
            * Si es Estudiante debe asignar carrera , turno y fechas
          </span>
          <div style={flexRow}>
            <select
              required
              name="idCarrera"
              value={estudianteCarrera.idCarrera}
              onChange={e => setEstudianteCarrera(prev => ({ ...prev, idCarrera: e.target.value }))}
              style={selectStyle}
            >
              <option value="">Carrera</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id}>{c.descripcion}</option>
              ))}
            </select>
            <select
              required
              name="turno"
              value={turnoSeleccionado}
              onChange={e => setTurnoSeleccionado(e.target.value)}
              style={selectStyle}
            >
              <option value="">Turno</option>
              {turnos.map(t => (
                <option key={t.idCatalogo} value={t.idCatalogo}>
                  {t.descripcionCatalogo}
                </option>
              ))}
            </select>
          </div>
          <div style={{ ...flexRow, ...dateInputWrapper }}>
            <label style={labelStyle}>
              Fecha Inicio
              <input
                required
                type="date"
                name="fechaInicio"
                value={estudianteCarrera.fechaInicio}
                onChange={e => setEstudianteCarrera(prev => ({ ...prev, fechaInicio: e.target.value }))}
                style={{ ...inputStyle, flex: '1 1 100%' }}
              />
              <small style={{ color: '#555', fontStyle: 'italic' }}>
                {formatearFecha(estudianteCarrera.fechaInicio)}
              </small>
            </label>

            <label style={labelStyle}>
              Fecha Fin
              <input
                required
                type="date"
                name="fechaFin"
                value={estudianteCarrera.fechaFin}
                onChange={e => setEstudianteCarrera(prev => ({ ...prev, fechaFin: e.target.value }))}
                style={{ ...inputStyle, flex: '1 1 100%' }}
              />
              <small style={{ color: '#555', fontStyle: 'italic' }}>
                {formatearFecha(estudianteCarrera.fechaFin)}
              </small>
            </label>
          </div>
        </fieldset>
      )}

      <button
        type="submit"
        style={{
          padding: '12px 25px',
          borderRadius: 5,
          cursor: 'pointer',
          backgroundColor: modoOscuro ? '#4caf50' : '#2e7d32',
          color: '#fff',
          fontWeight: '600',
          border: 'none',
          alignSelf: 'flex-start',
          marginTop: 10,
        }}
      >
        Guardar
      </button>
    </form>
  );
}
