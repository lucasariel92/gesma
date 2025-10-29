const ClienteCard = ({ cliente }) => {
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
      </div>

      <div className="px-6 pb-6 flex gap-2">
        <button className="flex-1 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium">
          Ver Detalles
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
          Editar
        </button>
      </div>
    </div>
  );
};

export default ClienteCard;