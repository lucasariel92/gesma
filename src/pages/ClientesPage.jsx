import { useState, useEffect } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from '../services/clientesService';
import ClienteCard from '../components/clientes/ClienteCard';
import ClienteModal from '../components/clientes/ClienteModal';
import DeleteConfirmModal from '../components/clientes/DeleteConfirmModal';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para toast
  const [toast, setToast] = useState(null);

  // Cargar clientes
  useEffect(() => {
    cargarClientes();
  }, []);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cuit?.includes(searchTerm)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes();
      setClientes(data);
      setFilteredClientes(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar clientes. Verifica tu conexión a Firebase.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCreateCliente = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleEditCliente = (cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCliente = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedCliente) {
        await updateCliente(selectedCliente.id, formData);
        showToast('Cliente actualizado exitosamente', 'success');
      } else {
        await createCliente(formData);
        showToast('Cliente creado exitosamente', 'success');
      }
      setIsModalOpen(false);
      cargarClientes();
    } catch (err) {
      showToast('Error al guardar el cliente', 'error');
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setModalLoading(true);
    try {
      await deleteCliente(selectedCliente.id);
      showToast('Cliente eliminado exitosamente', 'success');
      setIsDeleteModalOpen(false);
      cargarClientes();
    } catch (err) {
      showToast('Error al eliminar el cliente', 'error');
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando clientes..." />;

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger rounded-lg p-6 text-center">
        <div className="text-danger text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-danger mb-2">Error al cargar</h2>
        <p className="text-danger/80">{error}</p>
        <button
          onClick={cargarClientes}
          className="mt-4 px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Clientes</h1>
            <p className="text-gray-600 mt-1">Gestiona tus clientes y sus sucursales</p>
          </div>
          <button 
            onClick={handleCreateCliente}
            className="px-6 py-3 bg-accent text-dark rounded-lg hover:bg-accent-dark transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            + Nuevo Cliente
          </button>
        </div>

        {/* Buscador */}
        {clientes.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre, email o CUIT..."
          />
        )}
      </div>

      {/* Lista de clientes */}
      {filteredClientes.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-5xl mb-4">
            {searchTerm ? '🔍' : '📋'}
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otro término de búsqueda'
              : 'Comienza agregando tu primer cliente al sistema'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={handleCreateCliente}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              Agregar Cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => (
              <ClienteCard 
                key={cliente.id} 
                cliente={cliente}
                onEdit={() => handleEditCliente(cliente)}
                onDelete={() => handleDeleteClick(cliente)}
              />
            ))}
          </div>
          
          <div className="mt-8 text-center text-gray-600">
            {searchTerm ? (
              <span>
                Mostrando {filteredClientes.length} de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
              </span>
            ) : (
              <span>
                Total de clientes: <span className="font-semibold text-primary">{clientes.length}</span>
              </span>
            )}
          </div>
        </>
      )}

      {/* Modales */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitCliente}
        cliente={selectedCliente}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        clienteNombre={selectedCliente?.nombre}
        loading={modalLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ClientesPage;