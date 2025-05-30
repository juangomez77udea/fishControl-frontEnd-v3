import React, { useState } from 'react';
import { PiPencilSimpleLineFill } from "react-icons/pi";
import { MdArrowForward } from "react-icons/md";

type Etapa = 'alevinaje' | 'dedinaje' | 'levante' | 'engorde';
type Estanque = string;

interface Lote {
  id: number;
  idEstanque: string;
  cantidadAnimales: number;
  fechaIngreso: string;
  edadLoteDias: number;
  selected?: boolean;
}

const Producto: React.FC = () => {
  // Estados para los controles del formulario
  const [etapaSeleccionada, setEtapaSeleccionada] = useState<Etapa>('alevinaje');
  const [idEstanqueSeleccionado, setIdEstanqueSeleccionado] = useState<string>('A1');
  const [idLoteSeleccionado, setIdLoteSeleccionado] = useState<number>(1);
  const [fechaIngreso, setFechaIngreso] = useState<string>('');
  const [lotes, setLotes] = useState<Lote[]>([
    { id: 1, idEstanque: 'A1', cantidadAnimales: 95000, fechaIngreso: '31/03/2025', edadLoteDias: 5, selected: false },
    { id: 2, idEstanque: 'D4', cantidadAnimales: 95000, fechaIngreso: '31/03/2025', edadLoteDias: 10, selected: false },
  ]);

  // Generar opciones de estanques basadas en la etapa seleccionada
  const generarOpcionesEstanques = (etapa: Etapa): Estanque[] => {
    const prefix = etapa.charAt(0).toUpperCase();
    return Array.from({ length: 4 }, (_, i) => `${prefix}${i + 1}`);
  };

  // Manejar cambio de etapa
  const handleEtapaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etapa = e.target.value as Etapa;
    setEtapaSeleccionada(etapa);
    const nuevosEstanques = generarOpcionesEstanques(etapa);
    setIdEstanqueSeleccionado(nuevosEstanques[0]);
  };

  // Manejar selección de fila
  const toggleSeleccionFila = (id: number) => {
    setLotes(lotes.map(lote => 
      lote.id === id ? { ...lote, selected: !lote.selected } : lote
    ));
  };

  // Formatear número con separadores de miles
  const formatearNumero = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      {/* Contenedor Superior */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Etapa</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Selector de Etapa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
            <select
              value={etapaSeleccionada}
              onChange={handleEtapaChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="alevinaje">Alevinaje</option>
              <option value="dedinaje">Dedinaje</option>
              <option value="levante">Levante</option>
              <option value="engorde">Engorde</option>
            </select>
          </div>

          {/* Selector de ID Estanque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Id de estanque</label>
            <select
              value={idEstanqueSeleccionado}
              onChange={(e) => setIdEstanqueSeleccionado(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {generarOpcionesEstanques(etapaSeleccionada).map((estanque) => (
                <option key={estanque} value={estanque}>
                  {estanque}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de ID Lote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Id Lote</label>
            <select
              value={idLoteSeleccionado}
              onChange={(e) => setIdLoteSeleccionado(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>
                  {lote.id}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de ingreso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso a estanque</label>
            <div className="flex items-center">
              <input
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="ml-2 text-gray-500"></span>
            </div>
          </div>
        </div>

        {/* Cantidad de animales (solo lectura) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de animales</label>
          <div className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md">
            {formatearNumero(lotes.find(lote => lote.id === idLoteSeleccionado)?.cantidadAnimales || 0)}
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-4 justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Registrar en estanque
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
            Eliminar registro
          </button>
        </div>
      </div>

      {/* Contenedor Inferior - Tabla */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Seleccionar</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seleccionar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Lote
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Estanque
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad de Animales
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha ingreso a estanque
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad lote / días
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lotes.map((lote) => (
                <tr key={lote.id} className={lote.selected ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={lote.selected || false}
                      onChange={() => toggleSeleccionFila(lote.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lote.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lote.idEstanque}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatearNumero(lote.cantidadAnimales)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lote.fechaIngreso}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lote.edadLoteDias}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {/* Botón Editar con tooltip */}
                      <div className="relative group">
                        <button 
                          className="px-2 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 text-xs flex items-center justify-center"
                        >
                          <PiPencilSimpleLineFill className="text-sm" />
                        </button>
                        <span className="absolute z-10 w-auto p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg 
                                      opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2
                                      transition-opacity duration-300 whitespace-nowrap">
                          Editar lote
                          <span className="absolute w-2 h-2 bg-gray-800 rotate-45 bottom-0 left-1/2 -mb-1 -translate-x-1/2"></span>
                        </span>
                      </div>
                      
                      {/* Botón Ir a con tooltip */}
                      <div className="relative group">
                        <button 
                          className="px-2 py-2 bg-green-500 text-white rounded-md hover:bg-green-400 text-xs flex items-center justify-center"
                        >
                          <MdArrowForward className="text-sm" />
                        </button>
                        <span className="absolute z-10 w-auto p-2 text-xs text-white bg-gray-800 rounded-md shadow-lg 
                                      opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2
                                      transition-opacity duration-300 whitespace-nowrap">
                          Ir a estanque
                          <span className="absolute w-2 h-2 bg-gray-800 rotate-45 bottom-0 left-1/2 -mb-1 -translate-x-1/2"></span>
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Producto;