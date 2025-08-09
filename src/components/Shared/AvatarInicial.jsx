import React from "react";

const AvatarInicial = ({ nombre = "U", size = 140, onClick }) => {
  const inicial = nombre.charAt(0).toUpperCase();

  const coloresFondo = [
    "#ef4444", // rojo
    "#3b82f6", // azul
    "#10b981", // verde
    "#f59e0b", // amarillo
    "#8b5cf6", // morado
    "#ec4899", // rosa
  ];

  const colorIndex = inicial.charCodeAt(0) % coloresFondo.length;
  const bgColor = coloresFondo[colorIndex];

  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: bgColor,
    color: "white",
    fontSize: size / 2,
    fontWeight: "700",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
    cursor: onClick ? "pointer" : "default",
    position: "relative",
  };

  return (
    <div
      style={style}
      aria-label={`Avatar de ${nombre}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {inicial}
      <style>{`
        div:hover::after {
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
      `}</style>
    </div>
  );
};

export default AvatarInicial;
