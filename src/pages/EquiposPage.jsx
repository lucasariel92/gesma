import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEquipos, createEquipo, updateEquipo, deleteEquipo } from '../services/equiposService';
import { getSucursales } from '../services/sucursalesService';
import { getClientes } from '../services/clientesService';
import SearchBar from '../components/common/SearchBar';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const TIPOS_EQUIPO = [
  'UPS',
  'InRow',
  'Aire Acondicionado',
  'Grupo Electrógeno',
  'Central de Incendio',
  'Otro'
];

const EquiposPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipos, setEquipos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filteredEquipos, setFilteredEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState(searchParams.get('cliente') || '');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [searchTerm, equipos, filtroCliente, filtroTipo, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [equiposData, sucursalesData, clientesData] = await Promise.all([
        getEquipos(),
        getSucursales(),
        getClientes()
      ]);
      setEquipos(equiposData);
      setSucursales(sucursalesData);
      setClientes(clientesData);
      setFilteredEquipos(equiposData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...equipos];

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(e => 
        e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por cliente
    if (filtroCliente) {
      filtered = filtered.filter(e => e.clienteId === filtroCliente);
    }

    // Filtro por tipo
    if (filtroTipo) {
      filtered = filtered.filter(e => e.tipo === filtroTipo);
    }

    // Filtro por estado
    if (filtroEstado) {
      filtered = filtered.filter(e => e.estado === filtroEstado);
    }

    setFilteredEquipos(filtered);
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroCliente('');
    setFiltroTipo('');
    setFiltroEstado('');
    setSearchParams({});
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

  const getEstadoBadge = (estado) => {
    const colors = {
      'Activo': 'bg-success/10 text-success',
      'Inactivo': 'bg-gray-200 text-gray-700',
      'En Reparación': 'bg-warning/10 text-warning'
    };
    return colors[estado] || 'bg-gray-200 text-gray-700';
  };

  const contarEquiposPorTipo = () => {
    const counts = {};
    equipos.forEach(e => {
      counts[e.tipo] = (counts[e.tipo] || 0) + 1;
    });
    return counts;
  };

  if (loading) return <Loader message="Cargando equipos..." />;

  const equiposPorTipo = contarEquiposPorTipo();
  const hayFiltrosActivos = filtroCliente || filtroTipo || filtroEstado || searchTerm;

  return (
    <div>
      {/* Header */}
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

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-primary">{equipos.length}</div>
            <div className="text-sm text-gray-600">Total Equipos</div>
          </div>
          {Object.entries(equiposPorTipo).slice(0, 5).map(([tipo, count]) => (
            <div key={tipo} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-sm text-gray-600">{tipo}</div>
            </div>
          ))}
        </div>

        {/* Buscador */}
        {equipos.length > 0 && (
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar equipo por nombre, marca, modelo o N° serie..."
          />
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-gray-700">Filtros:</span>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los clientes</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Equipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_EQUIPO.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="En Reparación">En Reparación</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de equipos */}
      {filteredEquipos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {hayFiltrosActivos ? 'No se encontraron equipos' : 'No hay equipos registrados'}
          </h3>
          <p className="text-gray-500">
            {hayFiltrosActivos 
              ? 'Intenta ajustando los filtros de búsqueda'
              : 'Comienza agregando tu primer equipo'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipos.map((equipo) => {
              const sucursal = sucursales.find(s => s.id === equipo.sucursalId);
              const cliente = clientes.find(c => c.id === equipo.clienteId);
              return (
                <div key={equipo.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border">
                  <div className="bg-gradient-to-r from-primary to-primary-dark p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{equipo.nombre}</h3>
                        <p className="text-blue-100 text-sm">{cliente?.nombre || 'Cliente no encontrado'}</p>
                        <p className="text-blue-200 text-xs">{sucursal?.nombre || 'Sucursal no encontrada'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(equipo.estado)}`}>
                        {equipo.estado || 'Activo'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {equipo.tipo && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-accent/20 text-dark text-xs font-medium rounded">{equipo.tipo}</span>
                      </div>
                    )}
                    {equipo.marca && (
                      <div className="text-sm"><span className="font-medium">Marca:</span> {equipo.marca}</div>
                    )}
                    {equipo.modelo && (
                      <div className="text-sm"><span className="font-medium">Modelo:</span> {equipo.modelo}</div>
                    )}
                    {equipo.numeroSerie && (
                      <div className="text-sm"><span className="font-medium">N° Serie:</span> {equipo.numeroSerie}</div>
                    )}
                    {equipo.ubicacion && (
                      <div className="text-sm"><span className="font-medium">Ubicación:</span> {equipo.ubicacion}</div>
                    )}
                    {equipo.capacidad && (
                      <div className="text-sm"><span className="font-medium">Capacidad:</span> {equipo.capacidad}</div>
                    )}
                    {equipo.fechaInstalacion && (
                      <div className="text-xs text-gray-500">
                        Instalado: {new Date(equipo.fechaInstalacion.seconds * 1000).toLocaleDateString('es-AR')}
                      </div>
                    )}
                    {equipo.ultimoMantenimiento && (
                      <div className="text-xs text-gray-500">
                        Último mant.: {new Date(equipo.ultimoMantenimiento.seconds * 1000).toLocaleDateString('es-AR')}
                      </div>
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

          <div className="mt-8 text-center text-gray-600">
            Mostrando {filteredEquipos.length} de {equipos.length} equipo{equipos.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {isModalOpen && (
        <EquipoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          equipo={selectedEquipo}
          sucursales={sucursales}
          clientes={clientes}
          loading={modalLoading}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const EquipoModal = ({ isOpen, onClose, onSubmit, equipo, sucursales, clientes, loading }) => {
  const fechaInstalacion = equipo?.fechaInstalacion?.toDate 
    ? equipo.fechaInstalacion.toDate() 
    : equipo?.fechaInstalacion 
      ? new Date(equipo.fechaInstalacion) 
      : null;

  const [formData, setFormData] = useState({
    clienteId: equipo?.clienteId || '',
    sucursalId: equipo?.sucursalId || '',
    nombre: equipo?.nombre || '',
    tipo: equipo?.tipo || '',
    marca: equipo?.marca || '',
    modelo: equipo?.modelo || '',
    numeroSerie: equipo?.numeroSerie || '',
    ubicacion: equipo?.ubicacion || '',
    capacidad: equipo?.capacidad || '',
    fechaInstalacion: fechaInstalacion ? fechaInstalacion.toISOString().split('T')[0] : '',
    estado: equipo?.estado || 'Activo',
    criticidad: equipo?.criticidad || 'Media'
  });

  const [filteredSucursales, setFilteredSucursales] = useState([]);

  useEffect(() => {
    if (formData.clienteId) {
      const filtered = sucursales.filter(s => s.clienteId === formData.clienteId);
      setFilteredSucursales(filtered);
    } else {
      setFilteredSucursales([]);
    }
  }, [formData.clienteId, sucursales]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.sucursalId || !formData.clienteId) {
      alert('Nombre, cliente y sucursal son requeridos');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark p-6 text-white">
          <h2 className="text-2xl font-bold">{equipo ? 'Editar' : 'Nuevo'} Equipo</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cliente *</label>
              <select
                value={formData.clienteId}
                onChange={(e) => setFormData({...formData, clienteId: e.target.value, sucursalId: ''})}
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
              <label className="block text-sm font-medium mb-2">Sucursal *</label>
              <select
                value={formData.sucursalId}
                onChange={(e) => setFormData({...formData, sucursalId: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                required
                disabled={!formData.clienteId}
              >
                <option value="">Seleccionar sucursal</option>
                {filteredSucursales.map(s => (
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
                placeholder="Ej: UPS Principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Seleccionar tipo</option>
                {TIPOS_EQUIPO.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">N° de Serie</label>
              <input
                type="text"
                value={formData.numeroSerie}
                onChange={(e) => setFormData({...formData, numeroSerie: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Ubicación</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Ej: Sala de servidores - Rack 3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacidad</label>
              <input
                type="text"
                value={formData.capacidad}
                onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Ej: 10 kVA, 5000 BTU, 150 kW"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Instalación</label>
              <input
                type="date"
                value={formData.fechaInstalacion}
                onChange={(e) => setFormData({...formData, fechaInstalacion: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="En Reparación">En Reparación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Criticidad</label>
              <select
                value={formData.criticidad}
                onChange={(e) => setFormData({...formData, criticidad: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary"
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
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