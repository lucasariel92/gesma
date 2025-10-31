const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, clienteNombre, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-danger/10 rounded-full">
            <span className="text-4xl text-danger">⚠</span>
          </div>

          <h2 className="text-2xl font-bold text-center text-dark mb-2">
            ¿Eliminar cliente?
          </h2>
          
          <p className="text-center text-gray-600 mb-6">
            Estás por eliminar a <strong className="text-dark">{clienteNombre}</strong>.
            Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-medium shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;