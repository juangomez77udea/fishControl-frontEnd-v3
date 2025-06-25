import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { MdArrowForward } from "react-icons/md";
import { toast } from 'react-toastify';

// Stores
import { useBatchStore, type BatchState } from '../../store/batch-store';
import { useSpecieStore, type SpecieState } from '../../store/specie-store';
import { useProductStore, type ProductState } from '../../store/product-store';

// Types
import type { Batch } from '../../service/batch-service';
import type { Specie } from '../../service/specie-service';
import type { ProductPhase, CreateProductPayload } from '../../service/product-service';

type Estanque = string;

interface LoteEnTabla extends Batch {
  specieNameResolved: string;
  selected: boolean;
}

const Producto: React.FC = () => {
  const navigate = useNavigate();

  const [etapaSeleccionada, setEtapaSeleccionada] = useState<ProductPhase>('ALEVINAJE');
  const [idEstanqueSeleccionado, setIdEstanqueSeleccionado] = useState<string>('A1');
  const [idLoteSeleccionado, setIdLoteSeleccionado] = useState<string>('');
  const [fechaIngreso, setFechaIngreso] = useState<string>('');
  const [descripcionProducto, setDescripcionProducto] = useState<string>('');

  // ------ SELECTORES DE STORE ------
  const batchesFromStore = useBatchStore((state: BatchState) => state.batches);
  const fetchBatchesFromStore = useBatchStore((state: BatchState) => state.fetchBatches);
  const isLoadingBatches = useBatchStore((state: BatchState) => state.isLoading);

  const speciesFromStore = useSpecieStore((state: SpecieState) => state.species);
  const fetchSpeciesFromStore = useSpecieStore((state: SpecieState) => state.fetchSpecies);
  const isLoadingSpecies = useSpecieStore((state: SpecieState) => state.isLoading);

  // <-- 3. OBTENER PRODUCTOS Y SU ACCIÓN DE FETCH -->
  const productsFromStore = useProductStore((state: ProductState) => state.products);
  const fetchProducts = useProductStore((state: ProductState) => state.fetchProducts);
  
  const createProduct = useProductStore((state: ProductState) => state.createProduct);
  const isLoadingProductCreation = useProductStore((state: ProductState) => state.isLoading);

  const [seleccionesTabla, setSeleccionesTabla] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBatchesFromStore();
    fetchSpeciesFromStore();
    fetchProducts();
  }, [fetchBatchesFromStore, fetchSpeciesFromStore, fetchProducts]);

  const speciesMap = useMemo(() => {
    const map = new Map<string, string>();
    if (speciesFromStore) {
      speciesFromStore.forEach((specie: Specie) => map.set(specie.id, specie.name));
    }
    return map;
  }, [speciesFromStore]);

  const lotesParaTablaDisplay: LoteEnTabla[] = useMemo(() => {
    if (!batchesFromStore) return [];
    return batchesFromStore.map((batch: Batch) => ({
      ...batch,
      specieNameResolved: speciesMap.get(batch.specieId) || `ID Especie: ${batch.specieId}`,
      selected: !!seleccionesTabla[batch.id],
    }));
  }, [batchesFromStore, speciesMap, seleccionesTabla]);

  useEffect(() => {
    if (batchesFromStore && batchesFromStore.length > 0) {
      if (idLoteSeleccionado === '' || !batchesFromStore.some(l => l.id === idLoteSeleccionado)) {
        setIdLoteSeleccionado(batchesFromStore[0].id);
      }
    } else if (batchesFromStore && batchesFromStore.length === 0 && idLoteSeleccionado !== '') {
      setIdLoteSeleccionado('');
    }
  }, [batchesFromStore, idLoteSeleccionado]);

  const generarOpcionesEstanques = useCallback((etapa: ProductPhase): Estanque[] => {
    const prefix = etapa.charAt(0).toUpperCase();
    return Array.from({ length: 4 }, (_, i) => `${prefix}${i + 1}`);
  }, []);

  const handleEtapaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const etapa = e.target.value as ProductPhase;
    setEtapaSeleccionada(etapa);
    const nuevosEstanques = generarOpcionesEstanques(etapa);
    setIdEstanqueSeleccionado(nuevosEstanques[0]);
  }, [generarOpcionesEstanques]);

  const toggleSeleccionFila = useCallback((id: string) => {
    setSeleccionesTabla(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const formatearNumero = useCallback((num: number | undefined): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }, []);
  
  const loteActualParaFormulario = batchesFromStore?.find((lote: Batch) => lote.id === idLoteSeleccionado);

  const handleRegistrarEnEstanque = async () => {
    if (!loteActualParaFormulario) {
      toast.error("Por favor, seleccione un Lote de Origen.");
      return;
    }
    if (!idEstanqueSeleccionado) {
      toast.error("Por favor, seleccione un Identificador de Estanque.");
      return;
    }
    if (!etapaSeleccionada) {
        toast.error("Por favor, seleccione una Etapa del Producto.");
        return;
    }
    
    const specieNameFromMap = speciesMap.get(loteActualParaFormulario.specieId) || "Especie Desconocida";
    const productName = `Lote ${specieNameFromMap} (Origen Batch ${loteActualParaFormulario.id}) - Estanque ${idEstanqueSeleccionado}`;

    const payload: CreateProductPayload = {
      name: productName,
      description: descripcionProducto.trim() === "" ? undefined : descripcionProducto.trim(),
      phase: etapaSeleccionada,
      specieId: parseInt(loteActualParaFormulario.specieId, 10),
      pondIdentifier: idEstanqueSeleccionado,
    };
    const nuevoProducto = await createProduct(payload);
    if (nuevoProducto) {
      handleLimpiarFormulario();
    }
  };
  
  const handleLimpiarFormulario = useCallback(() => {
    setEtapaSeleccionada('ALEVINAJE');
    const primerosEstanques = generarOpcionesEstanques('ALEVINAJE');
    setIdEstanqueSeleccionado(primerosEstanques.length > 0 ? primerosEstanques[0] : '');
    if (batchesFromStore && batchesFromStore.length > 0) {
        setIdLoteSeleccionado(batchesFromStore[0].id);
    } else {
        setIdLoteSeleccionado('');
    }
    setFechaIngreso('');
    setDescripcionProducto('');
    setSeleccionesTabla({});
  }, [generarOpcionesEstanques, batchesFromStore]);

  const handleNavegarAEstanque = (batchId: string) => {
    const productoAsociado = productsFromStore.find(p => p.name.includes(`(Origen Batch ${batchId})`));

    if (productoAsociado) {
      navigate(`/estanque/${productoAsociado.id}`);
    } else {
      toast.info("Este lote aún no ha sido registrado en ningún estanque.");
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Producto en Etapa/Estanque</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="etapaProducto" className="block text-sm font-medium text-gray-700 mb-1">Etapa del Producto</label>
            <select id="etapaProducto" value={etapaSeleccionada} onChange={handleEtapaChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="ALEVINAJE">Alevinaje</option>
              <option value="DEDINAJE">Dedinaje</option>
              <option value="LEVANTE">Levante</option>
              <option value="ENGORDE">Engorde</option>
            </select>
          </div>
          <div>
            <label htmlFor="idEstanque" className="block text-sm font-medium text-gray-700 mb-1">Identificador de Estanque</label>
            <select id="idEstanque" value={idEstanqueSeleccionado} onChange={(e) => setIdEstanqueSeleccionado(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {generarOpcionesEstanques(etapaSeleccionada).map((estanque) => (<option key={estanque} value={estanque}>{estanque}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="idLoteOrigen" className="block text-sm font-medium text-gray-700 mb-1">Lote de Origen (Batch ID)</label>
            <select
              id="idLoteOrigen"
              value={idLoteSeleccionado}
              onChange={(e) => setIdLoteSeleccionado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingBatches || !batchesFromStore || batchesFromStore.length === 0}
            >
              {isLoadingBatches && (!batchesFromStore || batchesFromStore.length === 0) ? ( <option value="">Cargando lotes...</option>
              ) : (!batchesFromStore || batchesFromStore.length === 0) ? ( <option value="">No hay lotes disponibles</option>
              ) : (
                batchesFromStore.map((lote: Batch) => (
                  <option key={lote.id} value={lote.id}>
                    Lote {lote.id} ({speciesMap.get(lote.specieId) || `ID Especie ${lote.specieId}`})
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label htmlFor="fechaIngresoEstanque" className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso a estanque (Referencial)</label>
            <input id="fechaIngresoEstanque" type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="cantidadAnimalesLote" className="block text-sm font-medium text-gray-700 mb-1">Cantidad de animales (del lote de origen)</label>
          <div id="cantidadAnimalesLote" className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md">
            {loteActualParaFormulario ? formatearNumero(loteActualParaFormulario.quantityAnimals) : 'N/A'}
          </div>
        </div>
        <div className="mb-6">
            <label htmlFor="descripcionProducto" className="block text-sm font-medium text-gray-700 mb-1">Descripción del Producto (Opcional)</label>
            <textarea id="descripcionProducto" rows={3} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} placeholder="Observaciones sobre este producto/etapa. Ej: estado inicial del lote en este estanque."/>
        </div>
        <div className="flex space-x-4 justify-end">
          <button onClick={handleRegistrarEnEstanque} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50" disabled={isLoadingProductCreation || !loteActualParaFormulario || isLoadingBatches || isLoadingSpecies }>
            {isLoadingProductCreation ? "Registrando..." : "Registrar en estanque"}
          </button>
          <button type="button" onClick={handleLimpiarFormulario} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
            Cancelar / Limpiar
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lotes Disponibles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selección</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Lote (Batch)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especie</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. Animales</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso (Sistema)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad Lote (días)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(isLoadingBatches || (isLoadingSpecies && (!lotesParaTablaDisplay || lotesParaTablaDisplay.length === 0))) ? (
                <tr><td colSpan={7} className="text-center py-4">Cargando datos...</td></tr>
              ) : (!lotesParaTablaDisplay || lotesParaTablaDisplay.length === 0) ? (
                <tr><td colSpan={7} className="text-center py-4">No hay lotes (batches) para mostrar.</td></tr>
              ) : (
                lotesParaTablaDisplay.map((lote: LoteEnTabla) => (
                  <tr key={lote.id} className={lote.selected ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={lote.selected} onChange={() => toggleSeleccionFila(lote.id)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lote.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lote.specieNameResolved}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatearNumero(lote.quantityAnimals)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lote.entryDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lote.batchAge}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <div className="relative group"><button title="Editar Lote (Batch)" className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 text-xs flex items-center justify-center"><PiPencilSimpleLineFill className="text-sm" /></button></div>
                        {/* <-- 5. BOTÓN ACTUALIZADO --> */}
                        <div className="relative group">
                          <button 
                            title="Ir al estanque de este lote (si existe)" 
                            onClick={() => handleNavegarAEstanque(lote.id)}
                            className="px-2 py-2 bg-green-500 text-white rounded-md hover:bg-green-400 text-xs flex items-center justify-center"
                          >
                            <MdArrowForward className="text-sm" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Producto;