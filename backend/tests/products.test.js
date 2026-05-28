import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';
import bcrypt from 'bcryptjs';

describe('Product Endpoints', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    // Crear usuario admin
    const adminPassword = await bcrypt.hash('Admin123!@', 12);
    await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    // Crear usuario cliente
    const clientPassword = await bcrypt.hash('Client123!@', 12);
    await prisma.user.create({
      data: {
        email: 'client@test.com',
        password: clientPassword,
        name: 'Client User',
        role: 'CLIENT',
      },
    });

    // Obtener tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'Admin123!@' });

    const clientRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'client@test.com', password: 'Client123!@' });

    adminToken = adminRes.body.token;
    clientToken = clientRes.body.token;
  });

  beforeEach(async () => {
    // Limpiar productos antes de cada test
    await prisma.product.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * GET /api/products
   */
  describe('GET /api/products', () => {
    it('debe obtener lista vacía inicialmente', async () => {
      const res = await request(app)
        .get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('debe obtener productos con paginación', async () => {
      // Crear algunos productos
      for (let i = 0; i < 5; i++) {
        await prisma.product.create({
          data: {
            name: `Producto ${i}`,
            price: 10.00 + i,
            category: 'Almuerzo',
          },
        });
      }

      const res = await request(app)
        .get('/api/products?page=1&limit=3');

      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(3);
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.pages).toBe(2);
    });
  });

  /**
   * POST /api/products
   */
  describe('POST /api/products', () => {
    it('debe crear producto como admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Nuevo Producto',
          description: 'Descripción',
          price: 15.99,
          category: 'Desayuno',
        });

      expect(res.status).toBe(201);
      expect(res.body.product).toHaveProperty('id');
      expect(res.body.product.name).toBe('Nuevo Producto');
      expect(res.body.product.price).toBe(15.99);
    });

    it('debe rechazar creación sin autenticación', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Nuevo Producto',
          price: 15.99,
          category: 'Desayuno',
        });

      expect(res.status).toBe(401);
    });

    it('debe rechazar creación por usuario no-admin', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Nuevo Producto',
          price: 15.99,
          category: 'Desayuno',
        });

      expect(res.status).toBe(403);
    });

    it('debe validar campos requeridos', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Producto',
          // Falta price y category
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  /**
   * GET /api/products/:id
   */
  describe('GET /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Producto Test',
          price: 10.00,
          category: 'Almuerzo',
        },
      });
      productId = product.id;
    });

    it('debe obtener producto por ID', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(productId);
      expect(res.body.name).toBe('Producto Test');
    });

    it('debe retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/products/99999');

      expect(res.status).toBe(404);
    });
  });

  /**
   * PUT /api/products/:id
   */
  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Producto Original',
          price: 10.00,
          category: 'Almuerzo',
        },
      });
      productId = product.id;
    });

    it('debe actualizar producto como admin', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Producto Actualizado',
          price: 20.00,
        });

      expect(res.status).toBe(200);
      expect(res.body.product.name).toBe('Producto Actualizado');
      expect(res.body.product.price).toBe(20.00);
    });

    it('debe rechazar actualización por no-admin', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Nuevo Nombre' });

      expect(res.status).toBe(403);
    });
  });

  /**
   * DELETE /api/products/:id
   */
  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          name: 'Producto a Borrar',
          price: 10.00,
          category: 'Almuerzo',
        },
      });
      productId = product.id;
    });

    it('debe eliminar producto como admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verificar que fue eliminado
      const checkRes = await request(app)
        .get(`/api/products/${productId}`);

      expect(checkRes.status).toBe(404);
    });

    it('debe rechazar eliminación por no-admin', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });
  });
});
