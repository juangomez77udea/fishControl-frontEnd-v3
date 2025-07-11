import React from 'react';
import PondSelector from '../../components/estadistica/PondSelector';
import FeedingHistory from '../../components/estadistica/FeedingHistory';
import MortalityChart from '../../components/estadistica/MortalityChart';
import FoodSupply from '../../components/estadistica/FoodSupply';
const Estadistica: React.FC = () => {
  return (
    <div className="flex h-full flex-col gap-4 bg-gray-100 p-4">
      
      {/* Contenedor Superior */}
      <header className="rounded-lg bg-white p-4 shadow-md">
        <PondSelector />
      </header>

      { /*Contenedor Medio */ } 
      <main className="grid flex-grow grid-cols-1 gap-4 lg:grid-cols-2">
        
        {/* Contenedor Izquierdo */}
        <div className="min-h-[400px]">
          <FeedingHistory />
        </div>

        {/* Contenedor Derecho */}
        <div className="min-h-[400px]">
          <MortalityChart />
        </div>
      </main>

      { /* Contenedor Inferior */}
      <footer className="h-72 flex-shrink-0">
        <FoodSupply />
      </footer>

    </div>
  );
};

export default Estadistica;