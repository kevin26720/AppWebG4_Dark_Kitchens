import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmModal from '../components/ConfirmModal';
import productsAPI from '../api/productsAPI';
import useAuthStore from '../store/authStore';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery) {
        response = await productsAPI.search(searchQuery, selectedCategory);
      } else if (selectedCategory) {
        response = await productsAPI.search('', selectedCategory);
      } else {
        response = await productsAPI.getAll();
      }
      setProducts(response.products || response.data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (productId) => {
    setProductToDelete(productId);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setIsDeleting(true);
      await productsAPI.delete(productToDelete);
      setProducts(products.filter(p => p.id !== productToDelete));
      setShowConfirm(false);
      setProductToDelete(null);
      setError('');
    } catch (err) {
      setError('Error al eliminar producto');
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProduct = async (formData) => {
    try {
      setIsSaving(true);
      setError('');

      if (editingProduct) {
        // Editar producto existente
        await productsAPI.update(editingProduct.id, formData);
        setProducts(products.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...formData }
            : p
        ));
      } else {
        // Crear nuevo producto
        const response = await productsAPI.create(formData);
        setProducts([...products, response.product || response.data]);
      }

      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar producto');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">🍽️ Nuestro Catálogo</h1>
            <p className="text-lg opacity-90">
              Descubre nuestras deliciosas opciones para tu evento
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Barra de Control Admin */}
          {isAdmin && (
            <div className="mb-8 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text-dark">Gestión de Productos</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(true);
                }}
                className="btn-primary px-6 py-2"
              >
                ➕ Crear Producto
              </button>
            </div>
          )}

          {/* Barra de Búsqueda y Filtros */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4 mb-4 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Buscar productos..."
                className="input-field flex-1 min-w-xs"
              />
              <button type="submit" className="btn-primary px-6 py-2">
                Buscar
              </button>
            </div>

            {/* Categorías */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  loadProducts();
                }}
                className={`px-4 py-2 rounded-full font-semibold transition ${
                  selectedCategory === ''
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Grid de Productos */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-light text-lg">⏳ Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-light text-lg">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDeleteClick : undefined}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modales */}
        {showForm && isAdmin && (
          <ProductFormModal
            product={editingProduct}
            categories={categories}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            isLoading={isSaving}
          />
        )}

        {showConfirm && (
          <ConfirmModal
            title="🗑️ Eliminar Producto"
            message="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
            confirmText="Eliminar"
            cancelText="Cancelar"
            confirmColor="red"
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setShowConfirm(false);
              setProductToDelete(null);
            }}
            isLoading={isDeleting}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
