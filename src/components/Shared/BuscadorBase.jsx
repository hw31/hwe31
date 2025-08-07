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
        margin: "0 auto 20px",
        width: "90%",
        display: "flex",
        alignItems: "center",
        gap: titulo ? "20px" : 0, // solo si hay título
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
        className={texto}
        style={{
          width: "50%",
          padding: "8px 16px",
          fontSize: 16,
          borderRadius: "9999px",
            border: `1.2px solid ${modoOscuro ? "#444" : "#ccc"}`,
               outline: "none",
               boxShadow: modoOscuro
                 ? "inset 0 1px 4px rgba(234, 227, 227, 0.1)"
                 : "inset 0 1px 4px rgba(0,0,0,0.1)",
               color: texto,
             
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
