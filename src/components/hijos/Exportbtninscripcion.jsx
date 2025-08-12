import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const Exportbtninscripcion = ({ data = [], fileName = "export", titulo = "" }) => {
  // Limpiar datos para exportar (quitar campos no deseados)
  const prepararDatosParaExportar = (data) =>
    data.map(({ 
      estadoIcono,
      idCreador,
      idModificador,
      modificadorfechaModificacion,
      idEstado,
      idInscripcion,
      idUsuario,
      idPeriodoAcademico,
      modificador,
      fechaModificacion,
      ...rest 
    }) => rest);

  const dataParaExportar = prepararDatosParaExportar(data);

  const exportToExcel = async () => {
    if (!dataParaExportar.length) {
      alert("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Calificaciones");

    const columns = Object.keys(dataParaExportar[0]);

    // FILA 1: título fusionado
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = titulo || fileName;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { size: 16, bold: true, color: { argb: "FF000080" } };

    // FILA 3: encabezados
    columns.forEach((col, index) => {
      const cell = worksheet.getCell(3, index + 1);
      cell.value = col;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007BFF" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      // Ajustar ancho columna según contenido más largo
      const maxLength = Math.max(
        col.length,
        ...dataParaExportar.map((item) =>
          item[col] ? item[col].toString().length : 0
        )
      );

      worksheet.getColumn(index + 1).width = maxLength + 2; // Espacio extra
    });

    // FILAS DE DATOS desde fila 4
    dataParaExportar.forEach((item, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cell = worksheet.getCell(rowIndex + 4, colIndex + 1);
        cell.value = item[col];
        cell.alignment = { vertical: "middle", horizontal: "left" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if ((rowIndex + 1) % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCE6F1" },
          };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    if (!dataParaExportar.length) {
      alert("No hay datos para exportar");
      return;
    }

    const doc = new jsPDF();

    const columns = Object.keys(dataParaExportar[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));

    const columnStyles = {};
    columns.forEach(({ dataKey }) => {
      columnStyles[dataKey] = { cellWidth: "wrap" };
    });

    autoTable(doc, {
      columns,
      body: dataParaExportar,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [0, 123, 255] },
      margin: { top: 25, left: 10, right: 10 },
      columnStyles,
      didDrawPage: (dataArg) => {
        doc.setFontSize(14);
        doc.text(fileName, dataArg.settings.margin.left, 15);
      },
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="flex justify-end gap-3 mb-4">
 <button
  onClick={exportToExcel}
  className="flex items-center gap-2 px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
  title="Exportar a Excel"
  type="button"
>
  <FaFileExcel size={25} /> {/* Ícono más grande */}
</button>

<button
  onClick={exportToPDF}
  className="flex items-center gap-2 px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
  title="Exportar a PDF"
  type="button"
>
  <FaFilePdf size={25} /> {/* Ícono más grande */}
</button>

    </div>
  );
};

export default Exportbtninscripcion;
