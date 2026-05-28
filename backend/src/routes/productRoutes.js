import express from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/productController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

/**
 * Validaciones de entrada para productos
 */
const createProductValidations = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nombre del producto es requerido')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Precio debe ser un número positivo'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Categoría es requerida'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL de imagen inválida'),
];

const updateProductValidations = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Precio debe ser un número positivo'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Categoría no puede estar vacía'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL de imagen inválida'),
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available debe ser booleano'),
];

/**
 * RUTAS PÚBLICAS (lectura)
 */

/**
 * GET /api/products
 * Obtener todos los productos disponibles con paginación
 */
router.get('/', productController.getAllProducts);

/**
 * GET /api/products/categories/list
 * Obtener lista de categorías disponibles
 */
router.get('/categories/list', productController.getCategories);

/**
 * GET /api/products/search
 * Buscar productos por nombre o categoría
 */
router.get('/search', productController.searchProducts);

/**
 * GET /api/products/:id
 * Obtener un producto específico por ID
 */
router.get('/:id', productController.getProductById);

/**
 * RUTAS PROTEGIDAS (solo ADMIN)
 */

/**
 * POST /api/products
 * Crear nuevo producto (solo ADMIN)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  createProductValidations,
  handleValidationErrors,
  productController.createProduct
);

/**
 * PUT /api/products/:id
 * Actualizar producto (solo ADMIN)
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  updateProductValidations,
  handleValidationErrors,
  productController.updateProduct
);

/**
 * DELETE /api/products/:id
 * Eliminar producto (solo ADMIN)
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  productController.deleteProduct
);

export default router;
