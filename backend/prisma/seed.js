import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos anteriores (solo en desarrollo)
  await prisma.message.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.auditLog.deleteMany({});

  // Crear usuario ADMIN
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@catering.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuario ADMIN creado:', admin.email);

  // Crear usuario CLIENT de prueba
  const clientPassword = await bcrypt.hash('Client123!', 12);
  const client = await prisma.user.create({
    data: {
      email: 'cliente@example.com',
      password: clientPassword,
      name: 'Cliente Prueba',
      role: 'CLIENT',
    },
  });
  console.log('✅ Usuario CLIENT creado:', client.email);

  // Crear productos de muestra
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Bandeja Ejecutiva',
        description: 'Arroz con pollo, ensalada mixta y bebida',
        price: 8.50,
        category: 'Almuerzo',
        available: true,
      },
      {
        name: 'Caja Snack Premium',
        description: 'Surtido de bocaditos para eventos y reuniones',
        price: 15.00,
        category: 'Evento',
        available: true,
      },
      {
        name: 'Desayuno Ejecutivo',
        description: 'Pan tostado, huevos revueltos, jamón y jugo natural',
        price: 5.99,
        category: 'Desayuno',
        available: true,
      },
      {
        name: 'Ensalada César',
        description: 'Lechuga romana, croutons, queso parmesano y aderezo César',
        price: 7.50,
        category: 'Entrada',
        available: true,
      },
      {
        name: 'Pasta Carbonara',
        description: 'Pasta fresca con salsa carbonara y queso parmesano',
        price: 9.99,
        category: 'Plato Fuerte',
        available: true,
      },
      {
        name: 'Postre Tres Leches',
        description: 'Clásico pastel de tres leches',
        price: 4.50,
        category: 'Postre',
        available: true,
      },
    ],
  });
  console.log(`✅ ${products.count} productos creados`);

  // Crear algunos mensajes de prueba
  const message = await prisma.message.create({
    data: {
      content: 'Bienvenido al chat de soporte en tiempo real',
      userId: admin.id,
      room: 'general',
    },
  });
  console.log('✅ Mensaje de prueba creado');

  // Log de auditoría
  await prisma.auditLog.create({
    data: {
      action: 'SEED_INITIALIZED',
      resource: 'System',
      status: 'SUCCESS',
      details: 'Base de datos inicializada con datos de prueba',
    },
  });

  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
