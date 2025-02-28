import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../pages/Header/Header';

/*interface MenuLayoutProps {
  // Puedes añadir props si es necesario
}*/

const MenuLayout: React.FC<MenuLayoutProps> = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 mt-16">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MenuLayout;