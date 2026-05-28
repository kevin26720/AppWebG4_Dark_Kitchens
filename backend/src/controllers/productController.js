import { prisma } from '../db.js';

/**
 * Obtener todos los productos disponibles
 * GET /api/products
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filtros
    const where = { available: true };
    if (category) {
      where.category = category;
    }

    // Obtener productos y total
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      error: 'Error al obtener productos',
      code: 'PRODUCTS_FETCH_FAILED',
    });
  }
};

/**
 * Buscar productos por nombre o categoría
 * GET /api/products/search
 */
export const searchProducts = async (req, res) => {
  try {
    const { q, category } = req.query;

    if (!q && !category) {
      return res.status(400).json({
        error: 'Se requiere al menos un parámetro de búsqueda (q o category)',
        code: 'INVALID_SEARCH_PARAMS',
      });
    }

    const where = { available: true };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      take: 20,
    });

    res.json({
      query: { q, category },
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      error: 'Error al buscar productos',
      code: 'SEARCH_FAILED',
    });
  }
};

/**
 * Obtener producto por ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Error al obtener producto',
      code: 'PRODUCT_FETCH_FAILED',
    });
  }
};

/**
 * Crear nuevo producto (solo ADMIN)
 * POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        category: category.trim(),
        imageUrl,
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PRODUCT_CREATED',
        resource: 'Product',
        status: 'SUCCESS',
        details: JSON.stringify({
          productId: product.id,
          productName: product.name,
        }),
      },
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Error al crear producto',
      code: 'PRODUCT_CREATION_FAILED',
    });
  }
};

/**
 * Actualizar producto (solo ADMIN)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, available } = req.body;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category: category.trim() }),
        ...(imageUrl && { imageUrl }),
        ...(available !== undefined && { available }),
      },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PRODUCT_UPDATED',
        resource: 'Product',
        status: 'SUCCESS',
        details: JSON.stringify({
          productId: parseInt(id),
          changes: { name, description, price, category },
        }),
      },
    });

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Error al actualizar producto',
      code: 'PRODUCT_UPDATE_FAILED',
    });
  }
};

/**
 * Eliminar producto (solo ADMIN)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        code: 'PRODUCT_NOT_FOUND',
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PRODUCT_DELETED',
        resource: 'Product',
        status: 'SUCCESS',
        details: JSON.stringify({
          productId: parseInt(id),
          productName: product.name,
        }),
      },
    });

    res.json({
      message: 'Producto eliminado exitosamente',
      productId: parseInt(id),
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Error al eliminar producto',
      code: 'PRODUCT_DELETION_FAILED',
    });
  }
};

/**
 * Obtener categorías disponibles
 * GET /api/products/categories/list
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      where: { available: true },
    });

    res.json({
      categories: categories.map(c => c.category).sort(),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Error al obtener categorías',
      code: 'CATEGORIES_FETCH_FAILED',
    });
  }
};

export default {
  getAllProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
