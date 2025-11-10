import { useState, useEffect } from 'react';
import { getSucursalesByCliente, createSucursal, updateSucursal, deleteSucursal } from '../../services/sucursalesService';
import { getEquiposByCliente } from '../../services/equiposService';
import Toast from '../common/Toast';

const ClienteDetailModal = ({ isOpen, onClose, cliente }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [sucursales, setSucursales] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAddingSucursal, setIsAddingSucursal] = useState(false);
  const [newSucursal, setNewSucursal] = useState({ nombre: '', direccion: '', telefono: '' });

  useEffect(() => {
    if (isOpen && cliente) {
      cargarDatos();
    }
  }, [isOpen, cliente]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [sucursalesData, equiposData] = await Promise.all([
        getSucursalesByCliente(cliente.id),
        getEquiposByCliente(cliente.id)
      ]);
      setSucursales(sucursalesData);
      setEquipos(equiposData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSucursal = async () => {
    if (!newSucursal.nombre) {
      alert('El nombre es requerido');
      return;
    }
    try {
      await createSucursal({
        ...newSucursal,
        clienteId: cliente.id,
        esPrincipal: false
      });
      setToast({ message: 'Sucursal agregada', type: 'success' });
      setIsAddingSucursal(false);
      setNewSucursal({ nombre: '', direccion: '', telefono: '' });
      cargarDatos();
    } catch (err) {
      setToast({ message: 'Error al agregar sucursal', type: 'error' });
    }
  };

  const handleDeleteSucursal = async (sucursalId, esPrincipal) => {
    if (esPrincipal) {
      alert('No se puede eliminar la sucursal principal');
      return;
    }
    if (window.confirm('¿Eliminar esta sucursal?')) {
      try {
        await deleteSucursal(sucursalId);
        setToast({ message: 'Sucursal eliminada', type: 'success' });
        cargarDatos();
      } catch (err) {
        setToast({ message: 'Error al eliminar', type: 'error' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{cliente.nombre}</h2>
              <p className="text-blue-100 text-sm">{cliente.email}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl font-bold">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'info' ? 'bg-white text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            📋 Información
          </button>
          <button
            onClick={() => setActiveTab('sucursales')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'sucursales' ? 'bg-white text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            🏢 Sucursales ({sucursales.length})
          </button>
          <button
            onClick={() => setActiveTab('equipos')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'equipos' ? 'bg-white text-primary border-b-2 border-primary' : 'text-gray-600 hover:text-primary'
            }`}
          >
            ⚙️ Equipos ({equipos.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">CUIT</label>
                  <p className="text-lg">{cliente.cuit || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono</label>
                  <p className="text-lg">{cliente.telefono || 'No especificado'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Dirección</label>
                  <p className="text-lg">{cliente.direccion || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contacto Principal</label>
                  <p className="text-lg">{cliente.contactoPrincipal || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono Contacto</label>
                  <p className="text-lg">{cliente.telefonoContacto || 'No especificado'}</p>
                </div>
                {cliente.observaciones && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Observaciones</label>
                    <p className="text-lg">{cliente.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sucursales' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sucursales del cliente</h3>
                <button
                  onClick={() => setIsAddingSucursal(!isAddingSucursal)}
                  className="px-4 py-2 bg-accent text-dark rounded-lg hover:bg-accent-dark font-medium"
                >
                  + Agregar Sucursal
                </button>
              </div>

              {isAddingSucursal && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Nombre de la sucursal *"
                    value={newSucursal.nombre}
                    onChange={(e) => setNewSucursal({...newSucursal, nombre: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={newSucursal.direccion}
                    onChange={(e) => setNewSucursal({...newSucursal, direccion: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newSucursal.telefono}
                    onChange={(e) => setNewSucursal({...newSucursal, telefono: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddSucursal} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                      Guardar
                    </button>
                    <button onClick={() => setIsAddingSucursal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {sucursales.map(s => (
                  <div key={s.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{s.nombre}</h4>
                        {s.esPrincipal && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Principal</span>
                        )}
                      </div>
                      {s.direccion && <p className="text-sm text-gray-600">📍 {s.direccion}</p>}
                      {s.telefono && <p className="text-sm text-gray-600">📞 {s.telefono}</p>}
                    </div>
                    {!s.esPrincipal && (
                      <button
                        onClick={() => handleDeleteSucursal(s.id, s.esPrincipal)}
                        className="text-danger hover:text-danger/80"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'equipos' && (
            <div className="space-y-3">
              {equipos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-2">⚙️</div>
                  <p>No hay equipos registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipos.map(e => (
                    <div key={e.id} className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold text-lg">{e.nombre}</h4>
                      <p className="text-sm text-gray-600">Tipo: {e.tipo}</p>
                      {e.marca && <p className="text-sm text-gray-600">Marca: {e.marca}</p>}
                      {e.modelo && <p className="text-sm text-gray-600">Modelo: {e.modelo}</p>}
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        e.estado === 'Activo' ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {e.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ClienteDetailModal;