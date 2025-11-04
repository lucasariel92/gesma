import { useState, useEffect } from 'react';
import { getMantenimientos, createMantenimiento, updateMantenimiento, deleteMantenimiento } from '../services/mantenimientosService';
import { getEquipos } from '../services/equiposService';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const MantenimientosPage = () => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [filteredMantenimientos, setFilteredMantenimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMantenimientos(mantenimientos);
    } else {
      const filtered = mantenimientos.filter(m => 
        m.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tecnico?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMantenimientos(filtered);
    }
  }, [searchTerm, mantenimientos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [mantenimientosData, equiposData] = await Promise.all([
        getMantenimientos(),
        getEquipos()
      ]);
      setMantenimientos(mantenimientosData);
      setEquipos(equiposData);
      setFilteredMantenimientos(mantenimientosData);
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
    setSelectedMantenimiento(null);
    setIsModalOpen(true);
  };

  const handleEdit = (mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setIsModalOpen(true);
  };

  const handleDelete = async (mantenimientoId) => {
    if (window.confirm('¿Eliminar este mantenimiento?')) {
      try {
        await deleteMantenimiento(mantenimientoId);
        showToast('Mantenimiento eliminado', 'success');
        cargarDatos();
      } catch (err) {
        showToast('Error al eliminar', 'error');
      }
    }
  };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (selectedMantenimiento) {
        await updateMantenimiento(selectedMantenimiento.id, formData);
        showToast('Mantenimiento actualizado', 'success');
      } else {
        await createMantenimiento(formData);
        showToast('Mantenimiento creado', 'success');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      showToast('Error al guardar', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'Pendiente': 'bg-warning/10 text-warning',
      'En Proceso': 'bg-primary/10 text-primary',
      'Completado': 'bg-success/10 text-success',
      'Cancelado': 'bg-danger/10 text-danger'
    };
    return colors[estado] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <Loader message="Cargando mantenimientos..." />;

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark">Mantenimientos</h1>
            <p className="text-gray-600 mt-1">Gestiona los mantenimientos realizados</p>
          </div>
          <button 
            onClick={handleCreate}
            className="px-6 py-3 bg-accent text-dark rounded-lg hover:bg-accent-dark transition-colors font-semibold shadow-lg"
          >
            + Nuevo Mantenimiento
          </button>
        </div>

        {mantenimientos.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar mantenimiento..."
          />
        )}
      </div>

      {filteredMantenimientos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No se encontraron mantenimientos' : 'No hay mantenimientos'}
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMantenimientos.map((mant) => {
            const equipo = equipos.find(e => e.id === mant.equipoId);
            const fecha = mant.fecha?.toDate ? mant.fecha.toDate() : new Date(mant.fecha);
            return (
              <div key={mant.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-dark">{mant.tipo || 'Mantenimiento'}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(mant.estado)}`}>
                        {mant.estado || 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-gray-600">Equipo: {equipo?.nombre || 'No especificado'}</p>
                    <p className="text-sm text-gray-500">Fecha: {fecha.toLocaleDateString('es-AR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(mant)} className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 text-sm font-medium">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(mant.id)} className="px-4 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 text-sm font-medium">
                      Eliminar
                    </button>
                  </div>
                </div>
                {mant.descripcion && (
                  <p className="text-gray-700 mb-2">{mant.descripcion}</p>
                )}
                {mant.tecnico && (
                  <p className="text-sm text-gray-600">Técnico: {mant.tecnico}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <MantenimientoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          mantenimiento={selectedMantenimiento}
          equipos={equipos}
          loading={modalLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const MantenimientoModal = ({ isOpen, onClose, onSubmit, mantenimiento, equipos, loading }) => {
  const fecha = mantenimiento?.fecha?.toDate ? mantenimiento.fecha.toDate() : mantenimiento?.fecha ? new Date(mantenimiento.fecha) : new Date();
  const [formData, setFormData] = useState({
    equipoId: mantenimiento?.equipoId || '',
    tipo: mantenimiento?.tipo || '',
    fecha: fecha.toISOString().split('T')[0],
    tecnico: mantenimiento?.tecnico || '',
    descripcion: mantenimiento?.descripcion || '',
    estado: mantenimiento?.estado || 'Pendiente'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.equipoId || !formData.tipo) {
      alert('Equipo y tipo son requeridos');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <h2 className="text-2xl font-bold">{mantenimiento ? 'Editar' : 'Nuevo'} Mantenimiento</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Equipo *</label>
            <select
              value={formData.equipoId}
              onChange={(e) => setFormData({...formData, equipoId: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
                <option value="Inspección">Inspección</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completado">Completado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Técnico</label>
              <input
                type="text"
                value={formData.tecnico}
                onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="4"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary resize-none"
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

export default MantenimientosPage;