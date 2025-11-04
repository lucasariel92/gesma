import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardLayout from '../layouts/DashboardLayout';
import ClientesPage from '../pages/ClientesPage';
import SucursalesPage from '../pages/SucursalesPage';
import EquiposPage from '../pages/EquiposPage';
import MantenimientosPage from '../pages/MantenimientosPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/clientes" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={currentUser ? <Navigate to="/clientes" replace /> : <RegisterPage />} 
        />

        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/clientes" replace />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="sucursales" element={<SucursalesPage />} />
          <Route path="equipos" element={<EquiposPage />} />
          <Route path="mantenimientos" element={<MantenimientosPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;