import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PrivateRoute from '../components/common/PrivateRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import ClientesPage from '../pages/ClientesPage';
import EquiposPage from '../pages/EquiposPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={currentUser ? <Navigate to="/" replace /> : <RegisterPage />} 
        />

        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="equipos" element={<EquiposPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;