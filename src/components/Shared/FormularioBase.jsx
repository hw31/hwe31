import React from "react";

const FormularioBase = ({
  children,
  onSubmit,
  onCancel,
  modoOscuro = false,
  formError = "",
  formLoading = false,
  modoEdicion = false,
  titulo = "Formulario",
}) => {
  return (
    <div>
      <h3
        style={{
          marginBottom: 20,
          color: modoOscuro ? "#60a5fa" : "#1976d2",
          fontSize: 20,
          fontWeight: "bold",
        }}
      >
        {modoEdicion ? `Editar ${titulo}` : `Nuevo ${titulo}`}
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSubmit) onSubmit();
        }}
      >
        {children}

        {formError && (
          <p className="text-red-500 mb-3 font-semibold">{formError}</p>
        )}

        <div className="flex justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded border ${
              modoOscuro
                ? "border-gray-600 text-gray-300"
                : "border-gray-400 text-gray-700"
            }`}
            disabled={formLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${
              formLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={formLoading}
          >
            {formLoading
              ? "Guardando..."
              : modoEdicion
              ? "Actualizar"
              : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioBase;
