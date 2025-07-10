import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Stores
import { useProductStore, type ProductState } from '../../store/product-store';
import { useDailyRecordStore, type DailyRecordState } from '../../store/dailyRecord-store';
import { useStatisticsStore, type StatisticsState } from '../../store/statistics-store';

// Types
import type { DailyRecord } from '../../service/dailyRecord-service';
import type { ProductPhase } from '../../service/product-service';

// --- Constantes y Helpers ---
const ITEMS_PER_PAGE = 15;

const getFoodTypeFromPhase = (phase: ProductPhase): string => {
  switch (phase) {
    case 'ALEVINAJE':
    case 'DEDINAJE':
      return 'Alimento Inicio';
    case 'LEVANTE':
      return 'Alimento Levante';
    case 'ENGORDE':
      return 'Alimento Engorde';
    default:
      return 'No especificado';
  }
};

const LoadingSpinner: React.FC = () => (
    <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500 border-gray-200" />
    </div>
);

// --- Componente Principal ---
const FeedingHistory: React.FC = () => {
  const [displayedRecords, setDisplayedRecords] = useState<DailyRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- Conexión a los Stores de Zustand (CORREGIDO) ---
  const selectedProductId = useStatisticsStore((state: StatisticsState) => state.selectedProductId);
  const product = useProductStore((state: ProductState) => state.products.find(p => p.id === selectedProductId));
  
  // Se selecciona cada pieza del estado de forma individual para evitar el bucle infinito.
  const dailyRecordsByBatch = useDailyRecordStore((state: DailyRecordState) => state.dailyRecordsByBatch);
  const fetchDailyRecordsByBatchId = useDailyRecordStore((state: DailyRecordState) => state.fetchDailyRecordsByBatchId);
  const isLoading = useDailyRecordStore((state: DailyRecordState) => state.isLoading);
  
  // --- Lógica para obtener y procesar datos ---
  const batchId = useMemo(() => {
    if (!product?.name) return null;
    const match = product.name.match(/\(Origen Batch (\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  }, [product]);
  
  const allRecordsForBatch = useMemo(() => {
    if (!batchId || !dailyRecordsByBatch[batchId]) {
      return [];
    }
    return [...dailyRecordsByBatch[batchId]].sort((a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime());
  }, [batchId, dailyRecordsByBatch]);

  // --- Efectos para el ciclo de vida del componente ---
  useEffect(() => {
    if (batchId && !dailyRecordsByBatch[batchId]) {
      fetchDailyRecordsByBatchId(batchId);
    }
  }, [batchId, dailyRecordsByBatch, fetchDailyRecordsByBatchId]);

  useEffect(() => {
    setPage(1);
    if (allRecordsForBatch.length > 0) {
      setDisplayedRecords(allRecordsForBatch.slice(0, ITEMS_PER_PAGE));
      setHasMore(allRecordsForBatch.length > ITEMS_PER_PAGE);
    } else {
      setDisplayedRecords([]);
      setHasMore(false);
    }
  }, [allRecordsForBatch]);

  // --- Lógica para el scroll infinito ---
  const loadMoreRecords = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const nextPage = page + 1;
    const newRecords = allRecordsForBatch.slice(0, nextPage * ITEMS_PER_PAGE);
    
    setDisplayedRecords(newRecords);
    setPage(nextPage);
    setHasMore(newRecords.length < allRecordsForBatch.length);
  }, [page, hasMore, isLoading, allRecordsForBatch]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
        loadMoreRecords();
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreRecords]);

  // --- Cálculos y datos para la UI ---
  const foodType = product ? getFoodTypeFromPhase(product.phase) : 'N/A';
  const totalFoodInGrams = useMemo(() => {
    return allRecordsForBatch.reduce((sum, record) => sum + (record.foodSuppliedKg * 1000), 0);
  }, [allRecordsForBatch]);

  // --- Renderizado Condicional ---
  let content;
  if (!selectedProductId) {
    content = <p className="mt-2 text-center text-gray-500">Seleccione un estanque para ver su historial.</p>;
  } else if (isLoading && displayedRecords.length === 0) {
    content = <LoadingSpinner />;
  } else if (displayedRecords.length === 0) {
    content = <p className="mt-2 text-center text-gray-500">No hay registros de alimentación para este estanque.</p>;
  } else {
    content = (
      <table className="min-w-full">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="py-2 text-left text-sm font-medium text-gray-500">Fecha</th>
            <th className="py-2 text-left text-sm font-medium text-gray-500">Tipo de Alimento</th>
            <th className="py-2 text-right text-sm font-medium text-gray-500">Cantidad (gramos)</th>
          </tr>
        </thead>
        <tbody>
          {displayedRecords.map(record => (
            <tr key={record.id} className="border-t border-gray-200">
              <td className="py-3 text-sm text-gray-600">{new Date(record.recordDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
              <td className="py-3 text-sm text-gray-600">{foodType}</td>
              <td className="py-3 text-right text-sm font-semibold text-gray-800">
                {(record.foodSuppliedKg * 1000).toLocaleString('es-ES')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-md">
      <h2 className="flex-shrink-0 text-lg font-semibold text-gray-700">Historial de Alimentación</h2>
      <div ref={scrollContainerRef} className="mt-4 flex-grow overflow-y-auto pr-2">
        {content}
      </div>
      <div className="mt-2 flex-shrink-0 border-t-2 border-gray-300 pt-3 text-right">
        <span className="text-sm font-medium text-gray-500">Total</span>
        <span className="ml-4 text-base font-bold text-gray-900">
          {totalFoodInGrams.toLocaleString('es-ES')} g
        </span>
      </div>
    </div>
  );
};

export default FeedingHistory;