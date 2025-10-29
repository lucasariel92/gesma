import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardLayout from '../layouts/DashboardLayout';
import ClientesPage from '../pages/ClientesPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas - redirigen al dashboard si ya estás autenticado */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/clientes" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={currentUser ? <Navigate to="/clientes" replace /> : <RegisterPage />} 
        />

        {/* Rutas protegidas - requieren autenticación */}
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
        </Route>

        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;