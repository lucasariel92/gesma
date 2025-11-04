import { useState, useEffect } from 'react';
import { getEquipos, createEquipo, updateEquipo, deleteEquipo } from '../services/equiposService';
import { getSucursales } from '../services/sucursalesService';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const EquiposPage = () => {
  const [equipos, setEquipos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEquipos(equipos);
    } else {
      const filtered = equipos.filter(e => 
        e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipos(filtered);
    }
  }, [searchTerm, equipos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [equiposData, sucursalesData] = await Promise.all([
        getEquipos(),
        getSucursales()
      ]);
      setEquipos(equiposData);
      setSucursales(sucursalesData);
      setFilteredEquipos(equiposData);
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
    setSelectedEquipo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (equipo) => {
    setSelectedEquipo(equipo);
    setIsModalOpen(true);
  };

  const handleDelete = async (equipoId) => {
    if (window.confirm('¿Eliminar este equipo?')) {
      try {
        await deleteEquipo(equipoId);
        showToast('Equipo eliminado', 'success');
        cargarDatos();
      } catch (err) {
        showToast('Error al eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedEquipo) {
        await updateEquipo(selectedEquipo.id, formData);
        showToast('Equipo actualizado', 'success');
      } else {
        await createEquipo(formData);
        showToast('Equipo creado', 'success');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showToast('Error al guardar', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <Loader message="Cargando equipos..." />;

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Equipos</h1>
            <p className="text-gray-600 mt-1">Gestiona los equipos en cada sucursal</p>
          </div>
          <button 
            onClick={handleCreate}
            className="px-6 py-3 bg-accent text-dark rounded-lg hover:bg-accent-dark transition-colors font-semibold shadow-lg"
          >
            + Nuevo Equipo
          </button>
        </div>

        {equipos.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar equipo..."
          />
        )}
      </div>

      {filteredEquipos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron equipos' : 'No hay equipos'}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipos.map((equipo) => {
            const sucursal = sucursales.find(s => s.id === equipo.sucursalId);
            return (
              <div key={equipo.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border">
                <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
                  <h3 className="text-lg font-bold text-white">{equipo.nombre}</h3>
                  <p className="text-blue-100 text-sm">{sucursal?.nombre || 'Sucursal no encontrada'}</p>
                </div>
                <div className="p-4 space-y-2">
                  {equipo.marca && (
                    <div className="text-sm"><span className="font-medium">Marca:</span> {equipo.marca}</div>
                  )}
                  {equipo.modelo && (
                    <div className="text-sm"><span className="font-medium">Modelo:</span> {equipo.modelo}</div>
                  )}
                  {equipo.numeroSerie && (
                    <div className="text-sm"><span className="font-medium">N° Serie:</span> {equipo.numeroSerie}</div>
                  )}
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => handleEdit(equipo)} className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(equipo.id)} className="flex-1 px-3 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 text-sm font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <EquipoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          equipo={selectedEquipo}
          sucursales={sucursales}
          loading={modalLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const EquipoModal = ({ isOpen, onClose, onSubmit, equipo, sucursales, loading }) => {
  const [formData, setFormData] = useState({
    nombre: equipo?.nombre || '',
    marca: equipo?.marca || '',
    modelo: equipo?.modelo || '',
    numeroSerie: equipo?.numeroSerie || '',
    sucursalId: equipo?.sucursalId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.sucursalId) {
      alert('Nombre y sucursal son requeridos');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <h2 className="text-2xl font-bold">{equipo ? 'Editar' : 'Nuevo'} Equipo</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sucursal *</label>
            <select
              value={formData.sucursalId}
              onChange={(e) => setFormData({...formData, sucursalId: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar sucursal</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({...formData, marca: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Número de Serie</label>
            <input
              type="text"
              value={formData.numeroSerie}
              onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
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

export default EquiposPage;