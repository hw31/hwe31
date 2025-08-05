import React from "react";

const Paginacion = ({ paginaActual, totalPaginas, onPageChange }) => {
  if (totalPaginas <= 1) return null;

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      onPageChange(nuevaPagina);
    }
  };

  const renderNumerosPagina = () => {
    const paginas = [];

    const rango = 2;
    const inicio = Math.max(1, paginaActual - rango);
    const fin = Math.min(totalPaginas, paginaActual + rango);

    if (inicio > 1) {
      paginas.push(
        <button
          key={1}
          onClick={() => cambiarPagina(1)}
          className="px-2 py-1 mx-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          1
        </button>
      );
      if (inicio > 2) {
        paginas.push(<span key="start-ellipsis" className="mx-1">...</span>);
      }
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(
        <button
          key={i}
          onClick={() => cambiarPagina(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === paginaActual
              ? "bg-blue-600 text-white font-bold"
              : "hover:bg-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    if (fin < totalPaginas) {
      if (fin < totalPaginas - 1) {
        paginas.push(<span key="end-ellipsis" className="mx-1">...</span>);
      }
      paginas.push(
        <button
          key={totalPaginas}
          onClick={() => cambiarPagina(totalPaginas)}
          className="px-2 py-1 mx-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {totalPaginas}
        </button>
      );
    }

    return paginas;
  };

  return (
    <div className="flex justify-center mt-4 items-center flex-wrap gap-2">
      <button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 disabled:opacity-50"
      >
        Anterior
      </button>

      {renderNumerosPagina()}

      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Paginacion;
