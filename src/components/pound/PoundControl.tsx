import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Stores
import { useProductStore, type ProductState } from '../../store/product-store';
import { useDailyRecordStore, type DailyRecordState } from '../../store/dailyRecord-store';

// Types y Servicios
import type { CreateDailyRecordPayload, DailyRecord } from '../../service/dailyRecord-service';
import type { ProductPhase } from '../../service/product-service';

// Iconos
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaFilter } from 'react-icons/fa';

// --- COMPONENTES REUTILIZABLES ---

const ReadOnlyField: React.FC<{ label: string; id: string; value: string | number }> = ({ label, id, value }) => (
  <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
    <label htmlFor={id} className="whitespace-nowrap font-medium text-gray-600">{label}</label>
    <input type="text" id={id} name={id} value={value} readOnly className="w-full border-none bg-transparent p-0 text-gray-800 focus:outline-none focus:ring-0" />
  </div>
);

const EditableField: React.FC<{ label: string; id: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: 'text' | 'number' | 'date'; placeholder?: string; readOnly?: boolean; className?: string }> = ({ label, id, value, onChange, type = 'text', placeholder = '0', readOnly = false, className = '' }) => (
  <div className={`flex w-full items-center gap-3 rounded-xl border border-gray-300 ${readOnly ? 'bg-gray-50' : 'bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'} px-4 py-3 shadow-sm ${className}`}>
    <label htmlFor={id} className="whitespace-nowrap font-medium text-gray-600">{label}</label>
    <input type={type} id={id} name={id} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} className={`w-full border-none bg-transparent p-0 ${readOnly ? 'text-gray-800' : 'text-right text-gray-800'} focus:outline-none focus:ring-0`} />
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

// Obtener la fecha actual en formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// ------ COMPONENTE PRINCIPAL ------

const PoundControl = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  // --- ESTADOS DEL FORMULARIO ---
  const [foodSupplied, setFoodSupplied] = useState('');
  const [mortality, setMortality] = useState('');
  const [transferredAnimals, setTransferredAnimals] = useState('');
  const [destinationPhase, setDestinationPhase] = useState<ProductPhase>('ALEVINAJE');
  const [destinationPond, setDestinationPond] = useState('A1');
  const [isTransfersVisible, setIsTransfersVisible] = useState(false);
  const [observations, setObservations] = useState('');
  const [filterText, setFilterText] = useState('');
  const [recordDate, setRecordDate] = useState(getTodayString());
  
  // --- STORES ---
  const product = useProductStore((state: ProductState) => state.products.find(p => p.id.toString() === productId));
  const isLoadingProduct = useProductStore((state: ProductState) => state.isLoading);
  const fetchProducts = useProductStore((state: ProductState) => state.fetchProducts);
  
  const createDailyRecord = useDailyRecordStore((state: DailyRecordState) => state.createDailyRecord);
  const fetchDailyRecordsByBatchId = useDailyRecordStore((state: DailyRecordState) => state.fetchDailyRecordsByBatchId);
  const dailyRecordsByBatch = useDailyRecordStore((state: DailyRecordState) => state.dailyRecordsByBatch);
  const isLoadingDailyRecord = useDailyRecordStore((state: DailyRecordState) => state.isLoading);
  
  // --- LÓGICA DE DATOS ---
  const getBatchIdFromProduct = useCallback(() => {
    if (!product?.name) return null;
    const match = product.name.match(/\(Origen Batch (\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  }, [product]);

  const batchId = getBatchIdFromProduct();

  useEffect(() => {
    if (!product) {
      fetchProducts();
    }
  }, [product, fetchProducts]);
  
  useEffect(() => {
    if (batchId) {
      if (!dailyRecordsByBatch[batchId]) {
        fetchDailyRecordsByBatchId(batchId);
      }
    }
  }, [batchId, dailyRecordsByBatch, fetchDailyRecordsByBatchId]);
  
  const handleClearForm = useCallback(() => {
    setFoodSupplied('');
    setMortality('');
    setObservations('');
    setTransferredAnimals('');
    setIsTransfersVisible(false);
    setRecordDate(getTodayString());
  }, []);

  const handleRegister = async () => {
    if (!product || !batchId) {
      toast.error("No se pudo identificar el producto o lote de origen. Por favor, recargue la página.");
      return;
    }
    if (!foodSupplied.trim() || !mortality.trim() || !recordDate) {
      toast.error("La fecha, el alimento suministrado y la mortalidad son campos obligatorios.");
      return;
    }
    
    const foodInKg = Number(foodSupplied) / 1000;
      const payload: CreateDailyRecordPayload = {
      batchId: batchId,
      pondIdentifier: product.pondIdentifier,
      recordDate: recordDate,
      foodSuppliedKg: foodInKg,
      mortality: Number(mortality),
    };

    const newRecord = await createDailyRecord(payload);
    if (newRecord) {
      handleClearForm();
    }
  };

  const handleEdit = () => console.log("Botón Editar presionado.");
  
  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPhase = e.target.value as ProductPhase;
    setDestinationPhase(newPhase);
    const newPonds = generarOpcionesEstanques(newPhase);
    setDestinationPond(newPonds[0] || '');
  };

  const generarOpcionesEstanques = (etapa: ProductPhase): string[] => {
    const prefix = etapa.charAt(0).toUpperCase();
    return Array.from({ length: 4 }, (_, i) => `${prefix}${i + 1}`);
  };

  // --- DATOS PARA RENDERIZAR ---
  const history: DailyRecord[] = useMemo(() => (batchId ? dailyRecordsByBatch[batchId] : []) || [], [batchId, dailyRecordsByBatch]);
  const filteredHistory = useMemo(() => {
    if (!filterText) return history;
    return history.filter(item => 
      new Date(item.recordDate).toLocaleDateString('es-ES').includes(filterText)
    );
  }, [history, filterText]);

  // --- RENDERIZADO DEL COMPONENTE ---
  if (isLoadingProduct && !product) return <LoadingSpinner />;
  if (!product) return <div className="p-8 text-center text-red-500">No se encontró el producto con ID: {productId}. <button onClick={() => navigate('/producto')} className="ml-2 text-blue-500 underline">Volver</button></div>;

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

          <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <label htmlFor="fecha" className="whitespace-nowrap font-medium text-gray-600">Fecha:</label>
            <input 
              type="date" 
              id="fecha" 
              name="fecha" 
              value={recordDate} 
              onChange={(e) => setRecordDate(e.target.value)} 
              className="w-full border-none bg-transparent p-0 text-gray-800 focus:outline-none focus:ring-0" 
            />
          </div>
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
            <button onClick={handleRegister} className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoadingDailyRecord}>
              {isLoadingDailyRecord ? 'Registrando...' : 'Registrar'}
            </button>
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
        <div className="h-72 overflow-y-auto rounded-lg border">
          {isLoadingDailyRecord && history.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Alimento Suministrado (Kg)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Mortalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map(item => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(item.recordDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.foodSuppliedKg}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{item.mortality}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-sm text-gray-500">
                      {filterText ? 'No se encontraron registros con el filtro actual.' : 'No hay registros en el historial para este lote.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoundControl;