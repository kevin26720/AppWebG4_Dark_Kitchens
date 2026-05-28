import { useState } from 'react';

export const ProductCard = ({ product, onEdit, onDelete, isAdmin = false }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 animate-fadeIn">
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-5xl">🍽️</div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">NO DISPONIBLE</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-text-dark mb-1">{product.name}</h3>
        <p className="text-sm text-text-light mb-3 line-clamp-2">{product.description}</p>

        {/* Categoría y Precio */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-2xl font-bold text-primary">
            ${parseFloat(product.price).toFixed(2)}
          </span>
        </div>

        {/* Acciones */}
        {isAdmin ? (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 btn-secondary py-2 text-sm"
            >
              ✏️ Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors duration-200"
            >
              {isDeleting ? '⏳ ...' : '🗑️ Eliminar'}
            </button>
          </div>
        ) : (
          <button className="w-full btn-primary py-2 text-sm">
            🛒 Agregar al Carrito
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
