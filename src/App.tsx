import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import ForgetPassword from './pages/login/ForgetPassword';
import ChangePassword from './pages/login/ChangePassword';
import AuthLayouth from './layouts/AuthLayouth';
import Insumos from './pages/insumos/Insumos';
import Cultivo from './pages/cultivo/Cultivo';
import PrivateRoute from './routes/PrivateRoute';
import MenuLayout from './layouts/MenuLayout';
import Producto from './pages/producto/Producto';
import Estadistica from './pages/estadistica/Estadistica';

const App: React.FC = () => {
  return (
    <>
      <ToastContainer
        position="top-center" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ top: '1rem', left: '50%', transform: 'translateX(-50%)' }}
      />

      {/* Rutas de la aplicación */}
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
          } />
          <Route path="lotes" element={
            <PrivateRoute>
              <Cultivo />
            </PrivateRoute>
          } />
          <Route path="cultivo" element={
            <PrivateRoute>
              <Cultivo />
            </PrivateRoute>
          } />
          <Route path="producto" element={
            <PrivateRoute>
              <Producto />
            </PrivateRoute>
          } />
          <Route path="estadisticas" element={
            <PrivateRoute>
              <Estadistica />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default App;