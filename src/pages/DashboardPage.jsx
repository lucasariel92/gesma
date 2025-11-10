import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientes } from '../services/clientesService';
import { getSucursales } from '../services/sucursalesService';
import { getEquipos } from '../services/equiposService';
import Loader from '../components/common/Loader';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalSucursales: 0,
    totalEquipos: 0,
    equiposPorTipo: {},
    equiposPorEstado: {},
    equiposCriticos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const [clientes, sucursales, equipos] = await Promise.all([
        getClientes(),
        getSucursales(),
        getEquipos()
      ]);

      const equiposPorTipo = {};
      const equiposPorEstado = {};
      let equiposCriticos = 0;

      equipos.forEach(e => {
        equiposPorTipo[e.tipo] = (equiposPorTipo[e.tipo] || 0) + 1;
        equiposPorEstado[e.estado] = (equiposPorEstado[e.estado] || 0) + 1;
        if (e.criticidad === 'Alta') equiposCriticos++;
      });

      setStats({
        totalClientes: clientes.length,
        totalSucursales: sucursales.length,
        totalEquipos: equipos.length,
        equiposPorTipo,
        equiposPorEstado,
        equiposCriticos
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando estadísticas..." />;

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido al Sistema DCE!</h1>
        <p className="text-blue-100">Gestión integral de mantenimientos y equipos</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={() => navigate('/clientes')}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Clientes</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalClientes}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sucursales</p>
              <p className="text-3xl font-bold text-dark mt-2">{stats.totalSucursales}</p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/equipos')}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border-l-4 border-success"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Equipos</p>
              <p className="text-3xl font-bold text-success mt-2">{stats.totalEquipos}</p>
            </div>
            <div className="text-4xl">⚙️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Equipos Críticos</p>
              <p className="text-3xl font-bold text-danger mt-2">{stats.equiposCriticos}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipos por tipo */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-dark mb-4">Equipos por Tipo</h3>
          <div className="space-y-3">
            {Object.entries(stats.equiposPorTipo).map(([tipo, count]) => (
              <div key={tipo} className="flex items-center justify-between">
                <span className="text-gray-700">{tipo}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(count / stats.totalEquipos) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-primary w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipos por estado */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-dark mb-4">Equipos por Estado</h3>
          <div className="space-y-4">
            {Object.entries(stats.equiposPorEstado).map(([estado, count]) => {
              const colors = {
                'Activo': 'bg-success',
                'Inactivo': 'bg-gray-400',
                'En Reparación': 'bg-warning'
              };
              return (
                <div key={estado} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${colors[estado] || 'bg-gray-400'}`}></div>
                    <span className="text-gray-700">{estado}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-dark mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/clientes')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="text-3xl mb-2">➕</div>
            <div className="text-sm font-medium">Nuevo Cliente</div>
          </button>
          <button
            onClick={() => navigate('/equipos')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="text-sm font-medium">Nuevo Equipo</div>
          </button>
          <button
            onClick={() => navigate('/equipos')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-medium">Ver Reportes</div>
          </button>
          <button
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="text-3xl mb-2">🔧</div>
            <div className="text-sm font-medium">Próximamente</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;