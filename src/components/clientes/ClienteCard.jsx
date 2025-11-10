import { useNavigate } from 'react-router-dom';

const ClienteCard = ({ cliente, onEdit, onDelete, onViewDetails, equiposCount, sucursalesCount }) => {
  const navigate = useNavigate();

  const handleVerEquipos = () => {
    navigate(`/equipos?cliente=${cliente.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-primary to-primary-dark p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-primary font-bold text-xl">
              {cliente.nombre?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">
              {cliente.nombre || 'Sin nombre'}
            </h3>
            <p className="text-blue-100 text-sm">
              {cliente.email || 'Sin email'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {cliente.telefono && (
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📞</span>
            <span>{cliente.telefono}</span>
          </div>
        )}
        {cliente.cuit && (
          <div className="flex items-center text-gray-600">
            <span className="mr-2">🆔</span>
            <span>CUIT: {cliente.cuit}</span>
          </div>
        )}
        {cliente.direccion && (
          <div className="flex items-center text-gray-600">
            <span className="mr-2">📍</span>
            <span className="text-sm">{cliente.direccion}</span>
          </div>
        )}

        {/* Estadísticas */}
        <div className="pt-3 border-t flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span>🏢</span>
            <span className="font-semibold">{sucursalesCount || 0}</span>
            <span className="text-gray-500">Sucursales</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚙️</span>
            <span className="font-semibold">{equiposCount || 0}</span>
            <span className="text-gray-500">Equipos</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-2">
        <div className="flex gap-2">
          <button 
            onClick={onViewDetails}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            Ver Detalles
          </button>
          <button 
            onClick={handleVerEquipos}
            className="flex-1 px-4 py-2 bg-accent/20 text-dark rounded-lg hover:bg-accent/30 transition-colors font-medium"
          >
            Ver Equipos
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm"
          >
            Editar
          </button>
          <button 
            onClick={onDelete}
            className="flex-1 px-4 py-2 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors font-medium text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteCard;