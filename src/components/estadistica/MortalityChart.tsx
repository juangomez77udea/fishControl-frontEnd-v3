import React, { useMemo, useState, useEffect } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  TooltipItem,
  ChartOptions
} from 'chart.js';

// Stores
import { useProductStore, type ProductState } from '../../store/product-store';
import { useDailyRecordStore, type DailyRecordState } from '../../store/dailyRecord-store';
import { useStatisticsStore, type StatisticsState } from '../../store/statistics-store';
import { useBatchStore, type BatchState } from '../../store/batch-store'; // <-- 1. IMPORTAR EL STORE DE LOTES

// Iconos
import { FaChartBar, FaChartLine, FaChartPie, FaChartArea } from 'react-icons/fa';

//  componentes de Chart.js
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

// TIPOS Y COMPONENTES AUXILIARES
type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

const LoadingSpinner: React.FC = () => (
  <div className="flex h-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-purple-500 border-gray-200" />
  </div>
);

const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  const baseHue = 260;
  for (let i = 0; i < numColors; i++) {
    const saturation = 70 - ((i * 3) % 20);
    const lightness = 60 - ((i * 5) % 25);
    colors.push(`hsla(${baseHue}, ${saturation}%, ${lightness}%, 0.8)`);
  }
  return colors;
};


const MortalityChart: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Conexión a Stores
  const selectedProductId = useStatisticsStore((state: StatisticsState) => state.selectedProductId);
  const product = useProductStore((state: ProductState) => state.products.find(p => p.id === selectedProductId));
  const dailyRecordsByBatch = useDailyRecordStore((state: DailyRecordState) => state.dailyRecordsByBatch);
  const isLoadingRecords = useDailyRecordStore((state: DailyRecordState) => state.isLoading);

  const batches = useBatchStore((state: BatchState) => state.batches);
  const fetchBatches = useBatchStore((state: BatchState) => state.fetchBatches);

  useEffect(() => {
    if (batches.length === 0) {
      fetchBatches();
    }
  }, [batches.length, fetchBatches]);

  const batchId = useMemo(() => {
    if (!product?.name) return null;
    const match = product.name.match(/\(Origen Batch (\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  }, [product]);

  const selectedBatch = useMemo(() => {
    if (!batchId) return null;
    return batches.find(b => b.id === batchId.toString());
  }, [batchId, batches]);

  const processedData = useMemo(() => {
    if (!batchId || !dailyRecordsByBatch[batchId]) {
      return { labels: [], lineBarPieData: { datasets: [] }, scatterData: { datasets: [] } };
    }
    const sortedRecords = [...dailyRecordsByBatch[batchId]].sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());
    const recentRecords = sortedRecords.slice(-30);

    const labels = recentRecords.map(record =>
      new Date(record.recordDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    );
    const mortalityData = recentRecords.map(record => record.mortality);

    const scatterPoints = recentRecords.map(record => ({
      x: record.foodSuppliedKg,
      y: record.mortality,
    }));

    const dynamicColors = generateColors(mortalityData.length);
    const dynamicBorderColors = dynamicColors.map(color => color.replace('0.8', '1'));

    const lineBarPieData: ChartData<'bar' | 'line' | 'pie'> = {
      labels,
      datasets: [{
        label: 'Mortalidad Diaria',
        data: mortalityData,
        backgroundColor: chartType === 'line' ? 'rgba(139, 92, 246, 0.5)' : dynamicColors,
        borderColor: chartType === 'line' ? 'rgba(139, 92, 246, 1)' : dynamicBorderColors,
        borderRadius: 8,
        borderWidth: 1,
        tension: 0.3,
        fill: chartType === 'line',
      }],
    };

    const scatterData: ChartData<'scatter'> = {
      datasets: [{
        label: 'Mortalidad vs. Alimento (Kg)',
        data: scatterPoints,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      }],
    };

    return { labels, lineBarPieData, scatterData };
  }, [batchId, dailyRecordsByBatch, chartType]);

  // Opciones y Renderizado de Gráficos
  const renderChart = () => {
    const commonPlugins = {
      title: { display: false },
      tooltip: {
        backgroundColor: '#333',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    };

    switch (chartType) {
      case 'line': {
        const options: ChartOptions<'line'> = {
          responsive: true, maintainAspectRatio: false,
          plugins: { ...commonPlugins, legend: { display: false }, tooltip: { ...commonPlugins.tooltip, callbacks: { label: (ctx) => `Mortalidad: ${ctx.parsed.y}` } } },
          scales: { y: { beginAtZero: true, grid: { color: '#e5e7eb' } }, x: { grid: { display: false } } },
        };
        return <Line options={options} data={processedData.lineBarPieData as ChartData<'line'>} />;
      }
      case 'pie': {
        const options: ChartOptions<'pie'> = {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            ...commonPlugins, legend: { display: true, position: 'top' }, tooltip: {
              ...commonPlugins.tooltip, callbacks: {
                label: (context: TooltipItem<'pie'>) => {
                  const data = context.dataset.data as number[];
                  const total = data.reduce((acc, value) => acc + value, 0);
                  const value = context.parsed;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                  return `${context.label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
        };
        return <Pie options={options} data={processedData.lineBarPieData as ChartData<'pie'>} />;
      }
      case 'scatter': {
        const options: ChartOptions<'scatter'> = {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            ...commonPlugins, legend: { display: true }, tooltip: {
              ...commonPlugins.tooltip, callbacks: {
                label: (context: TooltipItem<'scatter'>) => {
                  const dataPoint = context.raw as { x: number, y: number };
                  return `Alimento: ${dataPoint.x.toFixed(2)} Kg, Mortalidad: ${dataPoint.y}`;
                }
              }
            }
          },
          scales: { y: { beginAtZero: true, grid: { color: '#e5e7eb' }, title: { display: true, text: 'Mortalidad' } }, x: { title: { display: true, text: 'Alimento (Kg)' }, grid: { display: false } } },
        };
        return <Scatter options={options} data={processedData.scatterData} />;
      }
      case 'bar':
      default: {
        const options: ChartOptions<'bar'> = {
          responsive: true, maintainAspectRatio: false,
          plugins: { ...commonPlugins, legend: { display: false }, tooltip: { ...commonPlugins.tooltip, callbacks: { label: (ctx) => `Mortalidad: ${ctx.parsed.y}` } } },
          scales: { y: { beginAtZero: true, grid: { color: '#e5e7eb' } }, x: { grid: { display: false } } },
        };
        return <Bar options={options} data={processedData.lineBarPieData as ChartData<'bar'>} />;
      }
    }
  };

  let content;
  if (!selectedProductId) {
    content = <p className="mt-2 text-center text-gray-500">Seleccione un estanque para ver el gráfico.</p>;
  } else if (isLoadingRecords && !processedData.labels.length) {
    content = <LoadingSpinner />;
  } else if (!processedData.labels.length) {
    content = <p className="mt-2 text-center text-gray-500">No hay datos de mortalidad para mostrar.</p>;
  } else {
    content = renderChart();
  }

  const ChartTypeSelector = () => (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
      <button onClick={() => setChartType('bar')} className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-white text-purple-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Gráfico de Barras"><FaChartBar /></button>
      <button onClick={() => setChartType('line')} className={`p-2 rounded-md ${chartType === 'line' ? 'bg-white text-purple-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Gráfico de Línea"><FaChartLine /></button>
      <button onClick={() => setChartType('pie')} className={`p-2 rounded-md ${chartType === 'pie' ? 'bg-white text-purple-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Gráfico Circular"><FaChartPie /></button>
      <button onClick={() => setChartType('scatter')} className={`p-2 rounded-md ${chartType === 'scatter' ? 'bg-white text-purple-600 shadow' : 'text-gray-500 hover:bg-gray-200'}`} title="Gráfico de Dispersión (vs. Alimento)"><FaChartArea /></button>
    </div>
  );

  return (
    <div className=" flex h-full flex-col rounded-lg bg-white p-4 shadow-md gap-4">

      <h2 className="w-full bg-green-100 text-lg font-semibold text-gray-700 p-2 rounded-md">
        Mortalidad
      </h2>
      <div className="flex flex-shrink-0 items-center justify-between">
        <div className="w-1/3"></div>
        <div className="w-1/3 text-center">
          {selectedBatch && (
            <div>
              <span className="block text-xs text-gray-500">Mortalidad Acumulada</span>
              <span className="text-xl font-bold text-gray-800">
                {selectedBatch.animalsRemoved.toLocaleString('es-ES')}
              </span>
            </div>
          )}
        </div>


        <div className="w-1/3 flex justify-end">
          <ChartTypeSelector />
        </div>
      </div>

      <div className="flex-grow">
        {content}
      </div>
    </div>
  );
};

export default MortalityChart;