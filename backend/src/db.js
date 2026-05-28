import { PrismaClient } from '@prisma/client';

/**
 * Instancia única de Prisma Client
 * Reutilizar en toda la aplicación para evitar múltiples conexiones
 */
export const prisma = new PrismaClient();

// Manejo de desconexión graceful
process.on('SIGINT', async () => {
  console.log('\n📤 Desconectando de la base de datos...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
