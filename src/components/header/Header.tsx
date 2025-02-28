import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Mi Aplicación
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Inicio</Link></li>
            <li><Link to="/about" className="hover:underline">Acerca de</Link></li>
            {username ? (
              <>
                <li>Bienvenido, {username}</li>
                <li>
                  <button onClick={onLogout} className="hover:underline">
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login" className="hover:underline">Iniciar sesión</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;