import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import contactoService from "../../services/Contacto";
import personaService from "../../services/Persona";
import catalogoService from "../../services/Catalogos";
import estadoService from "../../services/Estado";

import TablaBase from "../Shared/TablaBase";
import ContadoresBase from "../Shared/Contadores";
import ModalBase from "../Shared/ModalBase";
import FormularioBase from "../Shared/FormularioBase";

const FrmContacto = ({ busqueda }) => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const fondo = modoOscuro ? "bg-gray-900" : "bg-white";
  const texto = modoOscuro ? "text-gray-200" : "text-gray-800";
  const encabezado = modoOscuro ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700";

  const [contactos, setContactos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [estados, setEstados] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [form, setForm] = useState({
    idContacto: 0,
    idPersona: "",
    idTipoContacto: "",
    valorContacto: "",
    idEstado: "",
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resContactos, resPersonas, resCatalogos, resEstados] = await Promise.all([
        contactoService.listarContacto(),
        personaService.listarPersonas(),
        catalogoService.listarCatalogo(),
        estadoService.listarEstados(),
      ]);

      setContactos(resContactos.resultado || []);
      setPersonas(resPersonas?.data || []);
      setCatalogos(resCatalogos.resultado || []);
      setEstados(resEstados?.data || []);
      setFormError("");
    } catch (error) {
      console.error("Error al cargar datos de contacto:", error);
      setContactos([]);
      setFormError("Error al cargar contactos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalNuevo = () => {
    setForm({
      idContacto: 0,
      idPersona: "",
      idTipoContacto: "",
      valorContacto: "",
      idEstado: "",
    });
    setFormError("");
    setModoEdicion(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (contacto) => {
    setForm({
      idContacto: contacto.idContacto,
      idPersona: contacto.idPersona,
      idTipoContacto: contacto.idTipoContacto,
      valorContacto: contacto.valorContacto || "",
      idEstado: contacto.idEstado || "",
    });
    setFormError("");
    setModoEdicion(true);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormError("");
    setFormLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "idPersona" || name === "idTipoContacto" || name === "idEstado" ? Number(value) : value,
    }));
  };

  const handleGuardar = async () => {
    setFormError("");

    if (!form.idPersona) {
      setFormError("Debe seleccionar una persona.");
      return;
    }

    if (!form.idTipoContacto) {
      setFormError("Debe seleccionar un tipo de contacto.");
      return;
    }

    if (!form.valorContacto || form.valorContacto.trim() === "") {
      setFormError("El valor del contacto es obligatorio.");
      return;
    }

    if (!form.idEstado) {
      setFormError("Debe seleccionar un estado.");
      return;
    }

    setFormLoading(true);

    const datosEnviar = modoEdicion
      ? {
          IdContacto: form.idContacto,
          IdPersona: form.idPersona,
          IdTipoContacto: form.idTipoContacto,
          ValorContacto: form.valorContacto.trim(),
          IdEstado: form.idEstado,
        }
      : {
          IdPersona: form.idPersona,
          IdTipoContacto: form.idTipoContacto,
          ValorContacto: form.valorContacto.trim(),
          IdEstado: form.idEstado,
        };

    try {
      const res = modoEdicion
        ? await contactoService.actualizarContacto(datosEnviar)
        : await contactoService.insertarContacto(datosEnviar);

      if (res.numero >= 0) {
        Swal.fire("Éxito", res.mensaje || "Operación exitosa", "success");
        cerrarModal();
        cargarDatos();
      } else {
        setFormError(res.mensaje || "Error en la operación");
      }
    } catch (error) {
      const mensajeError =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        error.message ||
        "Error inesperado";
      setFormError(mensajeError);
    } finally {
      setFormLoading(false);
    }
  };

  const textoBusqueda = (busqueda || "").toLowerCase().trim();
  const contactosFiltrados = contactos.filter((c) => {
    const persona = personas.find((p) => p.idPersona === c.idPersona);
    const nombrePersona = persona
      ? `${persona.primerNombre} ${persona.segundoNombre || ""} ${persona.primerApellido} ${persona.segundoApellido || ""}`.toLowerCase()
      : "";

    const tipoContacto = catalogos.find((cat) => cat.idCatalogo === c.idTipoContacto)?.descripcionCatalogo.toLowerCase() || "";

    return (
      tipoContacto.includes(textoBusqueda) ||
      (c.valorContacto && c.valorContacto.toLowerCase().includes(textoBusqueda)) ||
      nombrePersona.includes(textoBusqueda)
    );
  });

  const activos = contactosFiltrados.filter((c) => c.idEstado === 1).length;
  const inactivos = contactosFiltrados.length - activos;

  const columnas = [
    {
      key: "nombrePersona",
      label: "Persona",
      render: (item) => {
        const persona = personas.find((p) => p.idPersona === item.idPersona);
        if (!persona) return "-";
        return `${persona.primerNombre} ${persona.segundoNombre || ""} ${persona.primerApellido} ${persona.segundoApellido || ""}`.trim();
      },
    },
    {
      key: "tipoContacto",
      label: "Tipo Contacto",
      render: (item) => {
        const tipo = catalogos.find(
          (cat) => cat.idCatalogo === item.idTipoContacto && cat.idTipoCatalogo === 7
        );
        return tipo ? tipo.descripcionCatalogo : "-";
      },
    },
    { key: "valorContacto", label: "Valor" },
    {
      key: "estado",
      label: "Estado",
      className: "text-center w-20",
      render: (item) =>
        item.idEstado === 1 ? (
           <span className="text-green-500 font-semibold flex justify-center">
            <FaCheckCircle size={20} />
                </span>
                ) : (
                <span className="text-red-500 font-semibold flex justify-center">
                <FaTimesCircle size={20} />
            </span>
            ),
    },
  ];

  return (
<>
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-wide ${
              modoOscuro ? "text-white" : "text-gray-800"
            }`}
          >
            Contactos
          </h2>
        </div>

        
          <div id="contactosContent" className="mt-4">
            <ContadoresBase
              activos={activos}
              inactivos={inactivos}
              total={contactosFiltrados.length}
              modoOscuro={modoOscuro}
              onNuevo={abrirModalNuevo}
            />

            <TablaBase
              datos={contactosFiltrados}
              columnas={columnas}
              modoOscuro={modoOscuro}
              loading={loading}
              texto={texto}
              encabezadoClase={encabezado}
              onEditar={abrirModalEditar}
            />
          </div>
        

        <ModalBase isOpen={modalOpen} onClose={cerrarModal} modoOscuro={modoOscuro}>
          <FormularioBase
            onSubmit={handleGuardar}
            onCancel={cerrarModal}
            modoOscuro={modoOscuro}
            formError={formError}
            formLoading={formLoading}
            modoEdicion={modoEdicion}
            titulo={modoEdicion ? "Editar Contacto" : "Nuevo Contacto"}
          >
            <div className="space-y-4">
              <select
                name="idPersona"
                value={form.idPersona || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Persona *</option>
                {personas.map((p) => (
                  <option key={p.idPersona} value={p.idPersona}>
                    {p.primerNombre} {p.segundoNombre || ""} {p.primerApellido} {p.segundoApellido || ""}
                  </option>
                ))}
              </select>

              <select
                name="idTipoContacto"
                value={form.idTipoContacto || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Tipo de Contacto *</option>
                {catalogos
                  .filter((c) => c.idTipoCatalogo === 7)
                  .map((c) => (
                    <option key={c.idCatalogo} value={c.idCatalogo}>
                      {c.descripcionCatalogo}
                    </option>
                  ))}
              </select>

              <input
                type="text"
                name="valorContacto"
                placeholder="Valor del Contacto *"
                value={form.valorContacto}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />

              <select
                name="idEstado"
                value={form.idEstado || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              >
                <option value="">Seleccione Estado *</option>
                {estados
                  .filter((e) => e.iD_Estado === 1 || e.iD_Estado === 2)
                  .map((e) => (
                    <option key={e.iD_Estado} value={e.iD_Estado}>
                      {e.nombre_Estado}
                    </option>
                  ))}
              </select>
            </div>
          </FormularioBase>
        </ModalBase>
  </>
  );
};

export default FrmContacto;
