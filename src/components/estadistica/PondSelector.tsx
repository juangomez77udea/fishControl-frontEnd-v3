import React, { useEffect } from 'react';

// Importamos los stores necesarios
import { useProductStore, type ProductState } from '../../store/product-store';
import { useStatisticsStore, type StatisticsState } from '../../store/statistics-store';

// Importamos un icono para el selector
import { FaChevronDown } from 'react-icons/fa';

const PondSelector: React.FC = () => {
  // Obtenemos los productos y la función para cargarlos
  const products = useProductStore((state: ProductState) => state.products);
  const fetchProducts = useProductStore((state: ProductState) => state.fetchProducts);
  const isLoading = useProductStore((state: ProductState) => state.isLoading);

  // Obtenemos el estado y la acción de nuestro nuevo store de estadísticas
  const selectedProductId = useStatisticsStore((state: StatisticsState) => state.selectedProductId);
  const setSelectedProductId = useStatisticsStore((state: StatisticsState) => state.setSelectedProductId);

  // Cargar los productos cuando el componente se monta por primera vez
  useEffect(() => {
    // Solo carga los productos si no hay ninguno en el store para evitar llamadas repetidas
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  // Manejador para cuando el usuario cambia la selección en el dropdown
  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    // Convertimos el valor a número o lo dejamos como null si es la opción por defecto
    setSelectedProductId(value ? parseInt(value, 10) : null);
  };

  return (
    // Contenedor principal con Flexbox para alinear elementos horizontalmente
    <div className="flex items-center gap-4">
      <label htmlFor="pond-selector" className="text-md font-medium text-gray-700">
        Estanque:
      </label>
      
      {/* Contenedor relativo para posicionar el icono del selector */}
      <div className="relative w-full max-w-xs">
        <select
          id="pond-selector"
          value={selectedProductId ?? ''} // Usamos '' si selectedProductId es null
          onChange={handleSelectionChange}
          disabled={isLoading || products.length === 0}
          // Clases de estilo para parecerse al mockup:
          // - appearance-none: quita el estilo por defecto del sistema operativo
          // - bg-gray-100: fondo gris claro
          // - border-none: sin borde
          // - pl-3 pr-10: padding para dejar espacio al texto y al icono
          className="w-full appearance-none rounded-md border-none bg-gray-100 p-3 pl-4 pr-10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
        >
          {/* Opción por defecto */}
          {!selectedProductId && !isLoading && <option value="">Seleccione...</option>}
          
          {/* Estado de carga */}
          {isLoading && <option value="">Cargando...</option>}

          {/* Mapeo de productos */}
          {!isLoading && products.map((product) => (
            <option key={product.id} value={product.id}>
              {/* Mostramos solo el identificador del estanque para un look más limpio */}
              {product.pondIdentifier} - ({product.name.split('(Origen Batch')[0].trim()})
            </option>
          ))}
        </select>
        
        {/* Icono de flecha hacia abajo posicionado a la derecha del selector */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
          <FaChevronDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default PondSelector;