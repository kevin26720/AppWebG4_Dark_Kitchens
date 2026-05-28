export const ConfirmModal = ({ 
  title = '⚠️ Confirmación',
  message = '¿Estás seguro?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'red',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const confirmColors = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    primary: 'bg-primary hover:bg-primary-dark',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-text-dark">{title}</h2>
        </div>

        {/* Message */}
        <div className="px-6 py-4">
          <p className="text-text-light">{message}</p>
        </div>

        {/* Botones */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-text-dark font-semibold rounded-lg transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-semibold rounded-lg transition disabled:opacity-50 ${confirmColors[confirmColor]}`}
          >
            {isLoading ? '⏳ ...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
