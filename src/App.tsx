import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import ForgetPassword from './pages/login/ForgetPassword';
import ChangePassword from './pages/login/ChangePassword';
import AuthLayouth from './layouts/AuthLayouth';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Rutas de autenticación */}
      <Route path="/" element={<AuthLayouth />}>
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="change-password/:token" element={<ChangePassword />} />
      </Route>

      {/* Ruta protegida para el menú */}
      
    </Routes>
  );
}

export default App;