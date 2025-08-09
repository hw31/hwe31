import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const ExportButtons = ({ data = [], fileName = "export" }) => {
  const exportToExcel = async () => {
    if (!data.length) {
      alert("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    const columns = Object.keys(data[0]);

    worksheet.columns = columns.map((col) => ({
      header: col,
      key: col,
      width: 20,
    }));

    data.forEach((item) => {
      worksheet.addRow(item);
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007BFF" },
      };
      cell.font = {
        color: { argb: "FFFFFFFF" },
        bold: true,
        name: "Arial",
        size: 12,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber !== 1) {
        const fillColor = rowNumber % 2 === 0 ? "FFDCE6F1" : "FFFFFFFF";
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
          cell.font = {
            name: "Arial",
            size: 11,
            color: { argb: "FF000000" },
          };
          cell.alignment = { vertical: "middle", horizontal: "left" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data.length) {
      alert("No hay datos para exportar");
      return;
    }

    const doc = new jsPDF();

    const columns = Object.keys(data[0]).map((key) => ({
      header: key,
      dataKey: key,
    }));

    autoTable(doc, {
      columns,
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 123, 255] },
      margin: { top: 25, left: 10, right: 10 },
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
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        title="Exportar a Excel"
      >
        <FaFileExcel />
        Exportar Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        title="Exportar a PDF"
      >
        <FaFilePdf />
        Exportar PDF
      </button>
    </div>
  );
};

export default ExportButtons;
