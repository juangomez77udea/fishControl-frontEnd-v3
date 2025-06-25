import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductStore, type ProductState } from '../../store/product-store';
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';
import type { ProductPhase } from '../../service/product-service';

type HistoryEntry = {
  id: number;
  date: string;
  foodSupplied: number;
  mortality: number;
};

const generateMockHistory = (count: number): HistoryEntry[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
    foodSupplied: Math.floor(Math.random() * 500) + 100,
    mortality: Math.floor(Math.random() * 20),
  }));
};

const FULL_MOCK_HISTORY = generateMockHistory(100);
const ITEMS_PER_PAGE = 20;

type Estanque = string;
const generarOpcionesEstanques = (etapa: ProductPhase): Estanque[] => {
  const prefix = etapa.charAt(0).toUpperCase();
  return Array.from({ length: 4 }, (_, i) => `${prefix}${i + 1}`);
};

// --- COMPONENTES REUTILIZABLES ---

const ReadOnlyField: React.FC<{ label: string; id: string; value: string | number }> = ({ label, id, value }) => (
  <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
    <label htmlFor={id} className="whitespace-nowrap font-medium text-gray-600">{label}</label>
    <input type="text" id={id} name={id} value={value} readOnly className="w-full border-none bg-transparent p-0 text-gray-800 focus:outline-none focus:ring-0" />
  </div>
);

const EditableField: React.FC<{ label: string; id: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: 'text' | 'number'; placeholder?: string }> = ({ label, id, value, onChange, type = 'text', placeholder = '0' }) => (
  <div className="flex w-full items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
    <label htmlFor={id} className="whitespace-nowrap font-medium text-gray-600">{label}</label>
    <input type={type} id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} className="w-full border-none bg-transparent p-0 text-right text-gray-800 focus:outline-none focus:ring-0" />
  </div>
);

const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[] }> = ({ label, id, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="font-medium text-gray-600">{label}</label>
    <select id={id} name={id} value={value} onChange={onChange} className="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center p-4">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500 border-gray-200"></div>
  </div>
);

// ------ COMPONENTE PRINCIPAL ------

const PoundControl = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  // Estados del formulario
  const [foodSupplied, setFoodSupplied] = useState('');
  const [mortality, setMortality] = useState('');
  const [transferredAnimals, setTransferredAnimals] = useState('');
  const [destinationPhase, setDestinationPhase] = useState<ProductPhase>('ALEVINAJE');
  const [destinationPond, setDestinationPond] = useState('A1');
  const [isTransfersVisible, setIsTransfersVisible] = useState(false);
  const [observations, setObservations] = useState('');

  // Estados para la tabla de historial con scroll infinito
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filterText, setFilterText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // <-- DATOS Y ACCIONES DEL STORE DE ZUSTAND -->
  const product = useProductStore((state: ProductState) => state.products.find(p => p.id.toString() === productId));
  const isLoadingProduct = useProductStore((state: ProductState) => state.isLoading);
  const fetchProducts = useProductStore((state: ProductState) => state.fetchProducts);

  useEffect(() => {
    if (!product) {
      fetchProducts();
    }
  }, [product, fetchProducts, productId]);

  const fetchMoreData = useCallback(() => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      const filteredData = FULL_MOCK_HISTORY.filter(item => item.date.includes(filterText));
      const newItems = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

      if (newItems.length > 0) {
        setHistory(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }

      const currentTotal = (page === 1 ? 0 : history.length) + newItems.length;
      if (currentTotal >= filteredData.length) {
        setHasMore(false);
      }

      setIsLoadingMore(false);
      if (page === 1) setIsInitialLoading(false);
    }, 1000);
  }, [isLoadingMore, page, filterText, history.length]);

  useEffect(() => {
    setHistory([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoading(true);
  }, [filterText]);

  useEffect(() => {
    if (isInitialLoading && page === 1 && hasMore) {
      fetchMoreData();
    }
  }, [isInitialLoading, page, hasMore, fetchMoreData])


  useEffect(() => {
    const container = scrollContainerRef.current;
    const handleScroll = () => {
      if (!container) return;
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
        if (hasMore && !isLoadingMore) fetchMoreData();
      }
    };
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, fetchMoreData]);

  // Manejadores de eventos
  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPhase = e.target.value as ProductPhase;
    setDestinationPhase(newPhase);
    const newPonds = generarOpcionesEstanques(newPhase);
    setDestinationPond(newPonds[0] || '');
  };

  const handleRegister = () => {
    const formData = {
      productId,
      date: new Date().toISOString().split('T')[0],
      foodSupplied: Number(foodSupplied) || 0,
      mortality: Number(mortality) || 0,
      observations,
      transfer: isTransfersVisible && Number(transferredAnimals) > 0 ? { amount: Number(transferredAnimals), destinationPhase, destinationPond } : null,
    };
    console.log("Datos a registrar:", formData);
  };

  const handleEdit = () => console.log("Botón Editar presionado.");

  if (isLoadingProduct && !product) return <div className="p-8 text-center">Cargando datos del estanque...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">No se encontró el producto con ID: {productId}. <button onClick={() => navigate('/producto')} className="ml-2 text-blue-500 underline">Volver</button></div>;

  const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const phaseOptions = [{ value: 'ALEVINAJE', label: 'Alevinaje' }, { value: 'DEDINAJE', label: 'Dedinaje' }, { value: 'LEVANTE', label: 'Levante' }, { value: 'ENGORDE', label: 'Engorde' }];
  const pondOptions = generarOpcionesEstanques(destinationPhase).map(pond => ({ value: pond, label: pond }));

  return (
    <div className="mx-auto w-full max-w-5xl rounded-lg bg-gray-50 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Control del Estanque: {product.pondIdentifier}</h1>
        <button onClick={() => navigate('/producto')} className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-green-600"><FaArrowLeft /> Volver</button>
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border-slate-600 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <ReadOnlyField label="Id Lote:" id="idLote" value={product.name} />
          <ReadOnlyField label="Id Estanque:" id="idEstanque" value={product.pondIdentifier} />
          <ReadOnlyField label="Fecha:" id="fecha" value={currentDate} />
        </div>
        <EditableField label="Alimento suministrado (gramos)" id="foodSupplied" type="number" value={foodSupplied} onChange={(e) => setFoodSupplied(e.target.value)} />
        <EditableField label="Mortalidad retirada" id="mortality" type="number" value={mortality} onChange={(e) => setMortality(e.target.value)} />
      </div>

      <div className="mb-6 rounded-lg border-slate-600 bg-white shadow-sm">
        <button onClick={() => setIsTransfersVisible(prev => !prev)} className="flex w-full items-center justify-between p-4 text-left font-semibold text-gray-700 hover:bg-gray-50">
          <span>Traslados</span>
          {isTransfersVisible ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isTransfersVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-gray-200 p-4">
            <div className="grid grid-cols-1 gap-y-4 gap-x-8 md:grid-cols-2">
              <EditableField label="Animales Trasladados" id="transferredAnimals" type="number" value={transferredAnimals} onChange={(e) => setTransferredAnimals(e.target.value)} />
              <div className="hidden md:block"></div>
              <SelectField label="Etapa:" id="destinationPhase" value={destinationPhase} onChange={handlePhaseChange} options={phaseOptions} />
              <SelectField label="Estanque destino:" id="destinationPond" value={destinationPond} onChange={(e) => setDestinationPond(e.target.value)} options={pondOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border-slate-600 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <label htmlFor="observations" className="font-medium text-gray-700">Observaciones:</label>
          <textarea id="observations" rows={5} className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Añadir observaciones sobre el control diario..." value={observations} onChange={(e) => setObservations(e.target.value)} />
          <div className="flex justify-end gap-4">
            <button onClick={handleRegister} className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-600">Registrar</button>
            <button onClick={handleEdit} className="rounded-lg bg-green-500 px-6 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-green-600">Editar</button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border-slate-700 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-700">Historial de Controles</h3>
        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaFilter className="text-gray-400" /></span>
          <input type="text" placeholder="Filtrar por fecha..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div ref={scrollContainerRef} className="h-72 overflow-y-auto rounded-lg border-slate-600
        ">
          {isInitialLoading ? <LoadingSpinner /> : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Alimento Suministrado (g)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Mortalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map(item => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.date}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.foodSupplied}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.mortality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {isLoadingMore && <LoadingSpinner />}
          {!hasMore && history.length > 0 && <p className="p-4 text-center text-sm text-gray-500">No hay más registros para mostrar.</p>}
          {!isInitialLoading && !hasMore && history.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No se encontraron registros con el filtro actual.</p>}
        </div>
      </div>
    </div>
  );
};

export default PoundControl;