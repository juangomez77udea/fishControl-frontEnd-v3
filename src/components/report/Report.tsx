// components/insumo/Report.tsx
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useInsumoStore } from '../../store/useInsumoStore';
import { toast } from 'react-toastify';

const Report: React.FC = () => {
  const { insumos } = useInsumoStore();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const generarPDF = () => {
    if (insumos.length === 0) {
      toast.error('No hay datos para exportar.');
      return;
    }

    try {
      const doc = new jsPDF();

      // Encabezado
      doc.setFontSize(18);
      doc.text('Reporte de Insumos', 105, 20, { align: 'center' });

      // Tabla de insumos
      const columns = [
        { header: 'Nombre', dataKey: 'nombre' },
        { header: 'Tipo', dataKey: 'type' },
        { header: 'Etapa', dataKey: 'stage' },
        { header: 'Cantidad', dataKey: 'cantidad' },
        { header: 'Presentación', dataKey: 'presentacion' },
        { header: 'Valor', dataKey: 'valor' },
        { header: 'Fecha de Ingreso', dataKey: 'fechaIngreso' },
      ];

      const data = insumos.map(insumo => ({
        nombre: insumo.nombre,
        type: insumo.type,
        stage: insumo.type === 'FOOD' ? insumo.stage : 'No aplica',
        cantidad: insumo.cantidad,
        presentacion: insumo.presentacion,
        valor: formatCurrency(insumo.valor),
        fechaIngreso: new Date(insumo.fechaIngreso).toLocaleDateString('es-ES'),
      }));

      let finalY = 0;

      autoTable(doc, {
        startY: 30,
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => item[col.dataKey as keyof typeof item] ?? '')),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
        didDrawPage: (data) => {
          if (data.cursor) {
            finalY = data.cursor.y;
          }
        },
      });

      // Calcular el total de los valores de los insumos
      const totalValor = insumos.reduce((total, insumo) => total + insumo.valor, 0);

      // se agrega al total del PDF sombreado y estilos de fuente
      autoTable(doc, {
        startY: finalY + 10,
        body: [
          [
            { content: 'Total', colSpan: 6, styles: { halign: 'right', fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' } },
            { content: formatCurrency(totalValor), styles: { halign: 'right', fillColor: [22, 160, 133], textColor: [255, 255, 255], fontStyle: 'bold' } },
          ],
        ],
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
        },
      });

      // Guardar PDF
      doc.save('reporte_insumos.pdf');
      toast.success('Reporte generado exitosamente.');
    } catch (error) {
      toast.error('Ocurrió un error al generar el reporte.');
      console.error('Error al generar el PDF:', error);
    }
  };

  return (
    <button
      onClick={generarPDF}
      className="px-2 py-2.5 bg-green-500 text-white rounded-md text-xs font-bold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
    >
      Generar PDF
    </button>
  );
};

export default Report;
