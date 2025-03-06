import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import ForgetPassword from './pages/login/ForgetPassword';
import ChangePassword from './pages/login/ChangePassword';
import AuthLayouth from './layouts/AuthLayouth';
import Insumos from './pages/insumos/Insumos';
import PrivateRoute from './routes/PrivateRoute';
import MenuLayout from './layouts/MenuLayout';

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
      
      {/* Rutas protegidas */}
      <Route path="/" element={<MenuLayout><Outlet /></MenuLayout>}>
        <Route path="insumos" element={
          <PrivateRoute>
            <Insumos />
          </PrivateRoute>
        }/>
        {/* agregar más rutas protegidas si es necesario */}
      </Route>
    </Routes>
  );
}

export default App;