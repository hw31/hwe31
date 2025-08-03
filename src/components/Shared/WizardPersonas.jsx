import React, { useState, useEffect } from "react";
import FormularioBase from "../Shared/FormularioBase";
import { FaUser, FaPhone, FaHome } from "react-icons/fa";
import Swal from "sweetalert2";

import { insertarPersona } from "../../services/Persona";
import { insertarContacto } from "../../services/Contacto";
import { insertarDireccion } from "../../services/Direccion";
import { filtrarPorTipoCatalogo } from "../../services/Catalogos";

const WizardPersonas = ({ onCerrar }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados para catálogos
  const [generos, setGeneros] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [tiposContacto, setTiposContacto] = useState([]);
  const [tiposDireccion, setTiposDireccion] = useState([]);

  useEffect(() => {
    // Cargar catálogos según tipo
    filtrarPorTipoCatalogo(1).then(setGeneros).catch(() => setGeneros([])); // GENERO
    filtrarPorTipoCatalogo(2).then(setNacionalidades).catch(() => setNacionalidades([])); // Nacionalidad
    filtrarPorTipoCatalogo(3).then(setTiposDocumento).catch(() => setTiposDocumento([])); // Tipo Documento
    filtrarPorTipoCatalogo(6).then(setCarreras).catch(() => setCarreras([])); // Carrera
    filtrarPorTipoCatalogo(7).then(setTiposContacto).catch(() => setTiposContacto([])); // Tipo Contacto
    filtrarPorTipoCatalogo(9).then(setTiposDireccion).catch(() => setTiposDireccion([])); // Tipo Direccion
  }, []);

  const [formData, setFormData] = useState({
    persona: {
      primerNombre: "",
      segundoNombre: "",
      primerApellido: "",
      segundoApellido: "",
      generoId: 0,
      tipoDocumentoId: 0,
      numeroDocumento: "",
      nacionalidadId: 0,
      carreraId: 0,
      idEstado: 0,
    },
    contacto: {
      idPersona: 0,
      idTipoContacto: 0,
      valorContacto: "",
      idEstado: 0,
    },
    direccion: {
      idPersona: 0,
      idTipoDireccion: 0,
      detalleDireccion: "",
      codigoPostal: "",
      municipio: "",
      departamento: "",
      referencia: "",
      idEstado: 0,
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const validarPaso = () => {
    switch (step) {
      case 1:
        if (
          !formData.persona.primerNombre.trim() ||
          !formData.persona.primerApellido.trim() ||
          formData.persona.generoId <= 0 ||
          formData.persona.tipoDocumentoId <= 0 ||
          formData.persona.nacionalidadId <= 0 ||
          formData.persona.carreraId <= 0
        ) {
          Swal.fire(
            "Atención",
            "Debe completar todos los campos obligatorios (*) en Persona",
            "warning"
          );
          return false;
        }
        return true;
      case 2:
        if (
          formData.contacto.idTipoContacto <= 0 ||
          !formData.contacto.valorContacto.trim()
        ) {
          Swal.fire(
            "Atención",
            "Debe completar todos los campos obligatorios (*) en Contacto",
            "warning"
          );
          return false;
        }
        return true;
      case 3:
        if (
          formData.direccion.idTipoDireccion <= 0 ||
          !formData.direccion.detalleDireccion.trim()
        ) {
          Swal.fire(
            "Atención",
            "Debe completar todos los campos obligatorios (*) en Dirección",
            "warning"
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const next = () => {
    if (validarPaso()) setStep((prev) => prev + 1);
  };
  const back = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!validarPaso()) return;

    setLoading(true);

    try {
      const resPersona = await insertarPersona(formData.persona);
      if (!resPersona.success) {
        Swal.fire("Error", resPersona.message || "Error al insertar persona", "error");
        setLoading(false);
        return;
      }
      const idPersona = resPersona.numero;
      if (!idPersona || idPersona <= 0) {
        Swal.fire("Error", "No se recibió un id válido de persona", "error");
        setLoading(false);
        return;
      }

      const contactoData = { ...formData.contacto, idPersona };
      const direccionData = { ...formData.direccion, idPersona };

      const resContacto = await insertarContacto(contactoData);
      if (!resContacto.success) {
        Swal.fire("Error", resContacto.message || "Error al insertar contacto", "error");
        setLoading(false);
        return;
      }

      const resDireccion = await insertarDireccion(direccionData);
      if (!resDireccion.success) {
        Swal.fire("Error", resDireccion.message || "Error al insertar dirección", "error");
        setLoading(false);
        return;
      }

      Swal.fire("¡Guardado!", "La información se envió correctamente", "success");
      if (onCerrar) onCerrar();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema al guardar la información", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormularioBase titulo="Datos de Persona" icono={<FaUser />}>
            <input
              type="text"
              className="input-form"
              placeholder="Primer Nombre *"
              value={formData.persona.primerNombre}
              onChange={(e) => handleChange("persona", "primerNombre", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Segundo Nombre"
              value={formData.persona.segundoNombre}
              onChange={(e) => handleChange("persona", "segundoNombre", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Primer Apellido *"
              value={formData.persona.primerApellido}
              onChange={(e) => handleChange("persona", "primerApellido", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Segundo Apellido"
              value={formData.persona.segundoApellido}
              onChange={(e) => handleChange("persona", "segundoApellido", e.target.value)}
              disabled={loading}
            />

            {/* Select Género */}
            <select
              className="input-form"
              value={formData.persona.generoId}
              onChange={(e) => handleChange("persona", "generoId", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Género *</option>
              {generos.map((g) => (
                <option key={g.idCatalogo} value={g.idCatalogo}>
                  {g.descripcionCatalogo}
                </option>
              ))}
            </select>

            {/* Select Tipo Documento */}
            <select
              className="input-form"
              value={formData.persona.tipoDocumentoId}
              onChange={(e) => handleChange("persona", "tipoDocumentoId", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Tipo Documento *</option>
              {tiposDocumento.map((t) => (
                <option key={t.idCatalogo} value={t.idCatalogo}>
                  {t.descripcionCatalogo}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="input-form"
              placeholder="Número Documento"
              value={formData.persona.numeroDocumento}
              onChange={(e) => handleChange("persona", "numeroDocumento", e.target.value)}
              disabled={loading}
            />

            {/* Select Nacionalidad */}
            <select
              className="input-form"
              value={formData.persona.nacionalidadId}
              onChange={(e) => handleChange("persona", "nacionalidadId", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Nacionalidad *</option>
              {nacionalidades.map((n) => (
                <option key={n.idCatalogo} value={n.idCatalogo}>
                  {n.descripcionCatalogo}
                </option>
              ))}
            </select>

            {/* Select Carrera */}
            <select
              className="input-form"
              value={formData.persona.carreraId}
              onChange={(e) => handleChange("persona", "carreraId", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Carrera *</option>
              {carreras.map((c) => (
                <option key={c.idCatalogo} value={c.idCatalogo}>
                  {c.descripcionCatalogo}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="input-form"
              placeholder="Estado (ID)"
              value={formData.persona.idEstado}
              onChange={(e) => handleChange("persona", "idEstado", Number(e.target.value))}
              disabled={loading}
            />
          </FormularioBase>
        );
      case 2:
        return (
          <FormularioBase titulo="Datos de Contacto" icono={<FaPhone />}>
            <select
              className="input-form"
              value={formData.contacto.idTipoContacto}
              onChange={(e) => handleChange("contacto", "idTipoContacto", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Tipo Contacto *</option>
              {tiposContacto.map((t) => (
                <option key={t.idCatalogo} value={t.idCatalogo}>
                  {t.descripcionCatalogo}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="input-form"
              placeholder="Valor Contacto *"
              value={formData.contacto.valorContacto}
              onChange={(e) => handleChange("contacto", "valorContacto", e.target.value)}
              disabled={loading}
            />

            <input
              type="number"
              className="input-form"
              placeholder="Estado (ID)"
              value={formData.contacto.idEstado}
              onChange={(e) => handleChange("contacto", "idEstado", Number(e.target.value))}
              disabled={loading}
            />
          </FormularioBase>
        );
      case 3:
        return (
          <FormularioBase titulo="Datos de Dirección" icono={<FaHome />}>
            <select
              className="input-form"
              value={formData.direccion.idTipoDireccion}
              onChange={(e) => handleChange("direccion", "idTipoDireccion", Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>Seleccione Tipo Dirección *</option>
              {tiposDireccion.map((t) => (
                <option key={t.idCatalogo} value={t.idCatalogo}>
                  {t.descripcionCatalogo}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="input-form"
              placeholder="Detalle Dirección *"
              value={formData.direccion.detalleDireccion}
              onChange={(e) => handleChange("direccion", "detalleDireccion", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Código Postal"
              value={formData.direccion.codigoPostal}
              onChange={(e) => handleChange("direccion", "codigoPostal", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Municipio"
              value={formData.direccion.municipio}
              onChange={(e) => handleChange("direccion", "municipio", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Departamento"
              value={formData.direccion.departamento}
              onChange={(e) => handleChange("direccion", "departamento", e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              className="input-form"
              placeholder="Referencia"
              value={formData.direccion.referencia}
              onChange={(e) => handleChange("direccion", "referencia", e.target.value)}
              disabled={loading}
            />
            <input
              type="number"
              className="input-form"
              placeholder="Estado (ID)"
              value={formData.direccion.idEstado}
              onChange={(e) => handleChange("direccion", "idEstado", Number(e.target.value))}
              disabled={loading}
            />
          </FormularioBase>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl">
      {renderStep()}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <button
            onClick={back}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
        )}
        {step < 3 && (
          <button
            onClick={next}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        )}
      </div>
      <button
        onClick={onCerrar}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
};

export default WizardPersonas;
