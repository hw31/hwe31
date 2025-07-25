import React from "react";

const ModalBase = ({ isOpen, onClose, children, modoOscuro }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: modoOscuro ? "#222" : "#fff",
          borderRadius: 15,
          maxWidth: 500,
          width: "100%",
          padding: 25,
          boxShadow: modoOscuro
            ? "0 8px 20px rgba(255,255,255,0.2)"
            : "0 8px 20px rgba(0,0,0,0.2)",
          color: modoOscuro ? "#eee" : "#222",
          animation: "fadeInScale 0.3s ease forwards",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalBase;