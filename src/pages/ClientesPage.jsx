import { useState, useEffect } from 'react';
import { getClientes } from '../services/clientesService';
import ClienteCard from '../components/clientes/ClienteCard';
import Loader from '../components/common/Loader';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        setError('Error al cargar clientes. Verifica tu conexión a Firebase.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarClientes();
  }, []);

  if (loading) return <Loader message="Cargando clientes..." />;

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger rounded-lg p-6 text-center">
        <div className="text-danger text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-danger mb-2">Error al cargar</h2>
        <p className="text-danger/80">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tus clientes y sus sucursales</p>
        </div>
        <button className="px-6 py-3 bg-accent text-dark rounded-lg hover:bg-accent-dark transition-colors font-semibold shadow-lg hover:shadow-xl">
          + Nuevo Cliente
        </button>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay clientes registrados
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza agregando tu primer cliente al sistema
          </p>
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold">
            Agregar Cliente
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map((cliente) => (
              <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
          </div>
          
          <div className="mt-8 text-center text-gray-600">
            Total de clientes: <span className="font-semibold text-primary">{clientes.length}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientesPage;