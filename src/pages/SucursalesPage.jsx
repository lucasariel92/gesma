import { useState, useEffect } from 'react';
import { getSucursales, createSucursal, updateSucursal, deleteSucursal } from '../services/sucursalesService';
import { getClientes } from '../services/clientesService';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const SucursalesPage = () => {
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredSucursales, setFilteredSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSucursal, setSelectedSucursal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSucursales(sucursales);
    } else {
      const filtered = sucursales.filter(s => 
        s.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSucursales(filtered);
    }
  }, [searchTerm, sucursales]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [sucursalesData, clientesData] = await Promise.all([
        getSucursales(),
        getClientes()
      ]);
      setSucursales(sucursalesData);
      setClientes(clientesData);
      setFilteredSucursales(sucursalesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleCreate = () => {
    setSelectedSucursal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sucursal) => {
    setSelectedSucursal(sucursal);
    setIsModalOpen(true);
  };

  const handleDelete = async (sucursalId) => {
    if (window.confirm('¿Eliminar esta sucursal?')) {
      try {
        await deleteSucursal(sucursalId);
        showToast('Sucursal eliminada', 'success');
        cargarDatos();
      } catch (err) {
        showToast('Error al eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedSucursal) {
        await updateSucursal(selectedSucursal.id, formData);
        showToast('Sucursal actualizada', 'success');
      } else {
        await createSucursal(formData);
        showToast('Sucursal creada', 'success');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showToast('Error al guardar', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando sucursales..." />;

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Sucursales</h1>
            <p className="text-gray-600 mt-1">Gestiona las sucursales de tus clientes</p>
          </div>
          <button 
            onClick={handleCreate}
            className="px-6 py-3 bg-accent text-dark rounded-lg hover:bg-accent-dark transition-colors font-semibold shadow-lg"
          >
            + Nueva Sucursal
          </button>
        </div>

        {sucursales.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar sucursal..."
          />
        )}
      </div>

      {filteredSucursales.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron sucursales' : 'No hay sucursales'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSucursales.map((sucursal) => {
            const cliente = clientes.find(c => c.id === sucursal.clienteId);
            return (
              <div key={sucursal.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
                  <h3 className="text-lg font-bold text-white">{sucursal.nombre}</h3>
                  <p className="text-blue-100 text-sm">{cliente?.nombre || 'Cliente no encontrado'}</p>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">📍</span>
                    <span>{sucursal.direccion || 'Sin dirección'}</span>
                  </div>
                  {sucursal.telefono && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="mr-2">📞</span>
                      <span>{sucursal.telefono}</span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => handleEdit(sucursal)} className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(sucursal.id)} className="flex-1 px-3 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 text-sm font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <SucursalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          sucursal={selectedSucursal}
          clientes={clientes}
          loading={modalLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const SucursalModal = ({ isOpen, onClose, onSubmit, sucursal, clientes, loading }) => {
  const [formData, setFormData] = useState({
    nombre: sucursal?.nombre || '',
    direccion: sucursal?.direccion || '',
    telefono: sucursal?.telefono || '',
    clienteId: sucursal?.clienteId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.clienteId) {
      alert('Nombre y cliente son requeridos');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <h2 className="text-2xl font-bold">{sucursal ? 'Editar' : 'Nueva'} Sucursal</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Cliente *</label>
            <select
              value={formData.clienteId}
              onChange={(e) => setFormData({...formData, clienteId: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SucursalesPage;