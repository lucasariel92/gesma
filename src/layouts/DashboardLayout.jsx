import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <Outlet />
      </main>

      <footer className="bg-dark border-t border-gray-700 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          © 2025 DCE Servicios - Gestión de Mantenimientos
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;