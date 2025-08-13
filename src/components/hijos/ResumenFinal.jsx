import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const ResumenFinal = ({
  estudiantes,
  calificaciones,
  tiposCalificacion,
  materiasDelGrupo,
  modoOscuro,
  idUsuario,
  rol,
  idPeriodoActivo,
}) => {
  const rolLower = rol ? rol.toLowerCase() : "";
  const esEstudiante = rolLower === "estudiante";

  const estudiantesFiltrados = esEstudiante
    ? estudiantes.filter(est => String(est.iD_Usuario) === String(idUsuario))
    : estudiantes;

  const estudiantesUnicos = estudiantesFiltrados.reduce((acc, est) => {
    if (!acc.find(e => e.iD_Inscripcion === est.iD_Inscripcion)) acc.push(est);
    return acc;
  }, []);

  const materiasUnicas = materiasDelGrupo.reduce((acc, mat) => {
    if (!acc.find(m => m.idMateria === mat.idMateria)) acc.push(mat);
    return acc;
  }, []);

  const notaFinalMateria = (idInscripcion, idMateria) => {
    const califs = calificaciones.filter(
      c =>
        c.idInscripcion === idInscripcion &&
        c.idMateria === idMateria &&
        c.idPeriodoAcademico === idPeriodoActivo
    );
    if (!califs.length) return 0;

    let sumaNotas = 0;
    let sumaMax = 0;

    tiposCalificacion.forEach(tipo => {
      if (!tipo.activo) return;
      const calif = califs.find(c => c.idTipoCalificacion === tipo.idTipoCalificacion);
      if (calif) sumaNotas += Number(calif.calificacion);
      sumaMax += tipo.valorMaximo;
    });

    return sumaMax === 0 ? 0 : (sumaNotas / sumaMax) * 100;
  };

  // Preparar datos para exportar
  const filasUnicas = [];
  estudiantesUnicos.forEach(est => {
    materiasUnicas
      .filter(mat =>
        calificaciones.some(
          c =>
            c.idInscripcion === est.iD_Inscripcion &&
            c.idMateria === mat.idMateria &&
            c.idPeriodoAcademico === idPeriodoActivo
        )
      )
      .forEach(mat => {
        const nota = notaFinalMateria(est.iD_Inscripcion, mat.idMateria);
        filasUnicas.push({
          Estudiante: est.nombreEstudiante,
          Materia: mat.nombreMateria,
          "Nota Final (%)": nota.toFixed(2),
          Estado: nota >= 60 ? "Aprobado" : "Reprobado",
        });
      });
  });

  const exportToExcel = async () => {
    if (!filasUnicas.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Calificaciones");

    const columns = Object.keys(filasUnicas[0]);

    // Título
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = "Resumen Final de Calificaciones";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true, color: { argb: "FF000080" } };

    // Encabezados
    columns.forEach((col, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = col;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007BFF" } };
      cell.border = {
        top: { style: "thin" }, left: { style: "thin" },
        bottom: { style: "thin" }, right: { style: "thin" },
      };

      const maxLength = Math.max(
        col.length,
        ...filasUnicas.map(item => item[col]?.toString().length || 0)
      );
      worksheet.getColumn(index + 1).width = maxLength + 2;
    });

    // Datos
    filasUnicas.forEach((item, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cell = worksheet.getCell(rowIndex + 4, colIndex + 1);
        cell.value = item[col];
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          top: { style: "thin" }, left: { style: "thin" },
          bottom: { style: "thin" }, right: { style: "thin" },
        };

        if ((rowIndex + 1) % 2 === 0) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCE6F1" } };
        }

        if (col === "Nota Final (%)" || col === "Estado") {
          const aprobado = item.Estado === "Aprobado";
          cell.font = { color: { argb: aprobado ? "FF008000" : "FFFF0000" }, bold: true };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "resumen_calificaciones.xlsx");
  };

  const exportToPDF = () => {
    if (!filasUnicas.length) return;

    const doc = new jsPDF();
    const columns = Object.keys(filasUnicas[0]).map(key => ({ header: key, dataKey: key }));
    autoTable(doc, {
      columns,
      body: filasUnicas,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [0, 123, 255] },
      margin: { top: 25, left: 10, right: 10 },
      didDrawPage: (dataArg) => {
        doc.setFontSize(14);
        doc.text("Resumen Final de Calificaciones", dataArg.settings.margin.left, 15);
      },
    });
    doc.save("resumen_calificaciones.pdf");
  };

  if (!esEstudiante) return null;
return (
  <div className="flex justify-center mt-8">
    <div className={`w-full max-w-4xl p-5 rounded-lg border ${modoOscuro ? "border-gray-700 bg-gray-800 text-gray-200" : "border-gray-300 bg-gray-50 text-gray-800"}`}>
      
      {/* Encabezado con título centrado y botones a la derecha */}
      <div className="relative flex items-center justify-between mb-4">
        {/* Título centrado */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h3 className="text-xl font-semibold">Notas</h3>
        </div>

        {/* Botones exportar */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={exportToExcel}
          style={{
            background: "linear-gradient(135deg, #127f45ff, #0c0b0bff)",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(2,79,33,0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #0c0b0bff, #127f45ff )")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #127f45ff, #080808)")
          }
        >
          <FaFileExcel size={25} />
        </button>

        <button
          onClick={exportToPDF}
          style={{
            background: "linear-gradient(135deg, #ef5350, #0c0b0bff)",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(244,67,54,0.4)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #101010ff, #de1717ff)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "linear-gradient(135deg, #ef5350, #0c0b0bff)")
          }
        >
          <FaFilePdf size={25} />
        </button>
      </div>

      </div>

      {/* Tabla centrada y adaptable */}
      <div className="overflow-x-auto">
        <table className="table-auto text-left text-sm border-collapse w-full">
          <thead>
            <tr>
              <th className="border px-3 py-2 whitespace-nowrap">Estudiante</th>
              <th className="border px-3 py-2 whitespace-nowrap">Materia</th>
              <th className="border px-3 py-2 whitespace-nowrap">Nota Final (%)</th>
              <th className="border px-3 py-2 whitespace-nowrap">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filasUnicas.map((item, idx) => (
              <tr key={idx}>
                <td className="border px-3 py-2 whitespace-nowrap">{item.Estudiante}</td>
                <td className="border px-3 py-2 whitespace-nowrap">{item.Materia}</td>
                <td className={`border px-3 py-2 font-bold whitespace-nowrap ${item.Estado === "Aprobado" ? "text-green-600" : "text-red-600"}`}>
                  {item["Nota Final (%)"]}%
                </td>
                <td className="border px-3 py-2 whitespace-nowrap">{item.Estado === "Aprobado" ? "✅ Aprobado" : "❌ Reprobado"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  </div>
);

};
export default ResumenFinal;
