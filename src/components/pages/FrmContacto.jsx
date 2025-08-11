import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, ArrowLeftCircle, } from "lucide-react";

const sections = [
  {
    title: "Nuestra Misión",
    content:
      "En CAL-I, nuestra misión es brindar una solución tecnológica eficiente, accesible y segura para el registro, organización y consulta de calificaciones en instituciones de educación superior. Buscamos mejorar los procesos académicos y administrativos, fortaleciendo la comunicación entre docentes, estudiantes y personal administrativo, para ofrecer una experiencia educativa más transparente y eficiente.",
  },
  {
    title: "Nuestra Visión",
    content:
      "Aspiramos a consolidarnos como una plataforma confiable y funcional que se adapte a diferentes contextos institucionales, contribuyendo a la transformación digital del sistema educativo nicaragüense. CAL-I busca ser un referente para la gestión académica moderna y flexible, capaz de apoyar la innovación y el desarrollo de las universidades.",
  },
  {
    title: "Nuestros Valores",
    content:
      "Eficiencia, Seguridad, Accesibilidad, Transparencia y Adaptabilidad son los valores que guían nuestro desarrollo. Optimizamos recursos, protegemos información, facilitamos el acceso, promovemos la claridad y adaptamos la plataforma a las necesidades específicas de cada institución educativa.",
    isList: true,
    listItems: [
      "Eficiencia: Optimizamos tiempo y recursos en la gestión de calificaciones, eliminando procesos manuales.",
      "Seguridad: Protegemos la información mediante autenticación y control de acceso por roles.",
      "Accesibilidad: Interfaz intuitiva y funcional para todo tipo de usuarios y dispositivos.",
      "Transparencia: Permite consultas claras y organizadas de registros académicos para estudiantes y docentes.",
      "Adaptabilidad: Flexible para ajustarse a las necesidades específicas de diferentes instituciones educativas.",
    ],
  },
  {
    title: "Sobre CAL-I",
    content:
      "CAL-I es una plataforma web desarrollada por estudiantes de Ingeniería en Sistemas de la Universidad de Managua, con el propósito de modernizar la gestión académica en el entorno universitario. Nuestra herramienta facilita el registro, organización y consulta de calificaciones, apoyando a docentes, estudiantes y personal administrativo para fortalecer la calidad educativa en Nicaragua.",
  },
];

const FrmAbout = () => {
  const modoOscuro = useSelector((state) => state.theme.modoOscuro);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    setIndex((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
  };

  const prev = () => {
    setIndex((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
  };

  const { title, content, isList, listItems } = sections[index];

  const handleVolver = () => {
    navigate("/dashboard/aulas"); // Cambia aquí la ruta si quieres otra
  };

  return (
    <>
      <style>{`
        /* Estilos para el botón flotante */
        .btn-volver {
          position: fixed;
          bottom: 20px;
          right: 20px; /* Cambia a left: 20px; si prefieres */
          background-color: ${modoOscuro ? "#334155" : "#f3f4f6"};
          color: ${modoOscuro ? "#a5f3fc" : "#2563eb"};
          border: none;
          border-radius: 50%;
          padding: 0.5rem;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          z-index: 1000;
        }
        .btn-volver:hover {
          background-color: ${modoOscuro ? "#475569" : "#60a5fa"};
          color: white;
        }
      `}</style>

      <div
        className={`max-w-3xl mx-auto p-6 mt-10 rounded-lg shadow-lg relative ${
          modoOscuro ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Botón Volver arriba (puedes mantenerlo o eliminarlo si quieres) */}
        

        <h1
          className={`text-4xl font-extrabold mb-8 text-center ${
            modoOscuro ? "text-white" : "text-gray-900"
          }`}
        >
          Acerca de CAL-I
        </h1>

        {/* Flecha izquierda */}
        <button
          onClick={prev}
          aria-label="Anterior"
          className={`absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full transition ${
            modoOscuro
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronLeft size={32} />
        </button>

        {/* Contenido */}
        <div className="min-h-[220px] px-10">
          <h2
            className={`text-2xl font-bold mb-4 ${
              modoOscuro ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h2>

          {isList ? (
            <ul
              className={`list-disc list-inside space-y-2 leading-relaxed ${
                modoOscuro ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {listItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p
              className={`leading-relaxed ${
                modoOscuro ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {content}
            </p>
          )}
        </div>

        {/* Flecha derecha */}
        <button
          onClick={next}
          aria-label="Siguiente"
          className={`absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full transition ${
            modoOscuro
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <ChevronRight size={32} />
        </button>

        {/* Indicadores */}
        <div className="flex justify-center mt-8 space-x-3">
          {sections.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-4 h-4 rounded-full transition-colors ${
                i === index
                  ? modoOscuro
                    ? "bg-blue-400"
                    : "bg-blue-600"
                  : modoOscuro
                  ? "bg-gray-600"
                  : "bg-gray-400"
              }`}
              aria-label={`Sección ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Botón flotante volver */}
      <button
        className="btn-volver"
        onClick={handleVolver}
        aria-label="Volver"
        title="Volver"
      >
        <ArrowLeftCircle size={24} />
      </button>
    </>
  );
};

export default FrmAbout;
