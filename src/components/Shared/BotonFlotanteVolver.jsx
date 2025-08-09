import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";

const BotonFlotanteVolver = ({ ruta = "/dashboard/menusetting" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(ruta)}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all"
      title="Volver al menú de configuración"
    >
      <ArrowLeftCircle size={28} />
    </button>
  );
};

export default BotonFlotanteVolver;
