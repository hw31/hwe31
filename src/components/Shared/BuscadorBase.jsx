import React from "react";

const BuscadorBase = ({
  valor = "",
  onChange = () => {},
  placeholder = "Buscar...",
  modoOscuro = false,
  texto = "text-black",
}) => {
  const baseColor = modoOscuro ? "#444" : "#ccc";
  const [borderColor, setBorderColor] = React.useState(baseColor);

  return (
    <div style={{ maxWidth: 600, margin: "20px auto 30px", width: "90%" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={valor}
        onChange={onChange}
        className={`${texto}`}
        style={{
          width: "50%",
          padding: "8px 16px",
          fontSize: 16,
          borderRadius: "9999px",
          border: `1.2px solid ${borderColor}`,
          outline: "none",
          boxShadow: modoOscuro
            ? "inset 0 1px 4px rgba(234, 227, 227, 0.1)"
            : "inset 0 1px 4px rgba(0,0,0,0.1)",
          color: "inherit",
          transition: "border-color 0.3s ease",
          display: "block",
          margin: "0 auto",
        }}
        onFocus={() => setBorderColor(modoOscuro ? "#90caf9" : "#1976d2")}
        onBlur={() => setBorderColor(baseColor)}
      />
    </div>
  );
};

export default BuscadorBase;