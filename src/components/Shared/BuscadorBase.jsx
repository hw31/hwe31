import React, { useState, useEffect, useMemo } from "react";

const BuscadorBase = ({
  valor = "",
  onChange = () => {},
  placeholder = "Buscar...",
  modoOscuro = false,
  texto = "text-black",
  titulo = "", // ← nuevo prop
}) => {
  const baseColor = useMemo(() => (modoOscuro ? "#444" : "#ccc"), [modoOscuro]);
  const [borderColor, setBorderColor] = useState(baseColor);

  useEffect(() => {
    setBorderColor(baseColor);
  }, [baseColor]);

  return (
  <div
  style={{
    maxWidth: 800,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto",
    width: "90%",
    padding: "0 15px",
    display: "flex",
    alignItems: "center",
    gap: titulo ? "20px" : 0,
    justifyContent: titulo ? "flex-start" : "center",
  }}
>

      {titulo && (
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            margin: 0,
          }}
        >
          {titulo}
        </h2>
      )}

     <input
  type="text"
  placeholder={placeholder}
  value={valor}
  onChange={onChange}
  className="w-full" // solo clases de layout, no color
  style={{
    width: "70%",
    padding: "12px 20px",
    fontSize: 16,
    borderRadius: "9999px",
    border: `1.2px solid ${modoOscuro ? "#444" : "#ccc"}`,
    outline: "none",
    boxShadow: modoOscuro
      ? "inset 0 1px 4px rgba(234, 227, 227, 0.1)"
      : "inset 0 1px 4px rgba(0,0,0,0.1)",
    color: modoOscuro ? "#fff" : "#111", // ✅ color según modoOscuro
    transition: "border-color 0.3s ease",
    display: "block",
    margin: "0 auto",
  }}
  onFocus={(e) =>
    (e.target.style.borderColor = modoOscuro ? "#90caf9" : "#1976d2")
  }
  onBlur={(e) =>
    (e.target.style.borderColor = modoOscuro ? "#444" : "#ccc")
  }
/>

    </div>
  );
};

export default BuscadorBase;
