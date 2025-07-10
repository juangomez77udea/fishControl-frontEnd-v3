import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useInsumoStore } from '../../store/useInsumoStore';
import type { Insumo } from '../../types/insumo';

// Iconos
import { FaSearch } from 'react-icons/fa';

const ITEMS_PER_PAGE = 10;

const LoadingSpinner: React.FC = () => (
  <div className="flex h-full items-center justify-center p-4">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500 border-gray-200" />
  </div>
);

const FoodSupply: React.FC = () => {
  const [filterText, setFilterText] = useState('');
  const [displayedSupplies, setDisplayedSupplies] = useState<Insumo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const insumos = useInsumoStore((state) => state.insumos);
  const fetchInsumos = useInsumoStore((state) => state.fetchInsumos);
  const isLoading = useInsumoStore((state) => state.isLoading);

  useEffect(() => {
    if (insumos.length === 0) {
      fetchInsumos();
    }
  }, [fetchInsumos, insumos.length]);

  const foodSupplies = useMemo(() => {
    return insumos.filter(insumo => insumo.type === 'FOOD');
  }, [insumos]);

  const filteredSupplies = useMemo(() => {
    if (!filterText) {
      return foodSupplies;
    }
    return foodSupplies.filter(supply =>
      supply.nombre.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [foodSupplies, filterText]);

  useEffect(() => {
    setPage(1);
    const initialItems = filteredSupplies.slice(0, ITEMS_PER_PAGE);
    setDisplayedSupplies(initialItems);
    setHasMore(filteredSupplies.length > ITEMS_PER_PAGE);
  }, [filteredSupplies]);

  const loadMoreSupplies = useCallback(() => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    const newSupplies = filteredSupplies.slice(0, nextPage * ITEMS_PER_PAGE);

    setDisplayedSupplies(newSupplies);
    setPage(nextPage);
    setHasMore(newSupplies.length < filteredSupplies.length);
  }, [page, hasMore, isLoading, filteredSupplies]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
        loadMoreSupplies();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreSupplies]);

  let content;
  if (isLoading && displayedSupplies.length === 0) {
    content = <LoadingSpinner />;
  } else if (foodSupplies.length === 0 && !isLoading) {
    content = <p className="mt-4 text-center text-gray-500">No hay insumos de alimento disponibles.</p>;
  } else if (filteredSupplies.length === 0 && filterText) {
    content = <p className="mt-4 text-center text-gray-500">No se encontraron insumos con ese filtro.</p>;
  } else {
    content = (
      <table className="min-w-full">
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            <th className="py-2 text-left text-sm font-medium text-gray-500">Etapa Alimento</th>
            <th className="py-2 text-center text-sm font-medium text-gray-500">Unidades</th>
            <th className="py-2 text-right text-sm font-medium text-gray-500">Cantidad (Kg)</th>
          </tr>
        </thead>
        <tbody>
          {displayedSupplies.map(supply => (
            <tr key={supply.id} className="border-t border-gray-200">
              <td className="py-3 text-sm font-semibold text-gray-800">{supply.nombre}</td>
              <td className="py-3 text-center text-sm text-gray-600">
                {typeof supply.cantidad === 'number' ? supply.cantidad : 'N/A'}
              </td>
              <td className="py-3 text-right text-sm text-gray-600">
                {typeof supply.totalWeightKg === 'number'
                  ? supply.totalWeightKg.toLocaleString('es-ES')
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg bg-white p-4 shadow-md gap-4">
      <h2 className="w-full bg-blue-300 p-2 text-lg font-semibold text-gray-700 rounded-md">
        Insumos de Alimento en Stock
      </h2>
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full rounded-md border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-blue-500"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex-grow overflow-y-auto pr-2">
        {content}
      </div>
    </div>
  );
};

export default FoodSupply;