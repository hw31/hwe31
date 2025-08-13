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
               (e.currentTarget.style.background = "linear-gradient(135deg, #127f45ff, #080808 )")
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
   
  );
};

export default Exportbtninscripcion;
