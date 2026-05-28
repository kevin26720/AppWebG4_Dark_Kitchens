import { useState, useEffect } from 'react';
import productsAPI from '../api/productsAPI';

export const ProductFormModal = ({ 
  product = null, 
  categories = [],
  onSave, 
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        available: product.available !== false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }
    if (!formData.category.trim()) {
      setError('La categoría es requerida');
      return;
    }

    try {
      onSave(formData);
    } catch (err) {
      setError(err.message || 'Error al guardar producto');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white p-4 sticky top-0">
          <h2 className="text-xl font-bold">
            {product ? '✏️ Editar Producto' : '➕ Crear Producto'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">
              📝 Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Pasta a la Carbonara"
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">
              📄 Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el producto..."
              className="input-field w-full h-20 resize-none"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1">
                💰 Precio
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1">
                🏷️ Categoría
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-dark mb-1">
              🖼️ URL de Imagen
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-text-dark">✅ Disponible</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-text-dark font-semibold py-2 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary py-2 disabled:opacity-50"
            >
              {isLoading ? '⏳ Guardando...' : product ? '💾 Actualizar' : '➕ Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
