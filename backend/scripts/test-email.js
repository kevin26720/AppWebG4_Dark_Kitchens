/**
 * Test Email Service
 * Ejecutar: node scripts/test-email.js
 */

import dotenv from 'dotenv';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../src/utils/email.js';

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Email Service Test\n');
  console.log('Configuration:');
  console.log(`  SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`  SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`  SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`  SMTP_FROM: ${process.env.SMTP_FROM}`);
  console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL}\n`);

  // Validar configuración
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error('❌ Error: Email no configurado. Ver EMAIL_SETUP.md\n');
    console.log('Instrucciones:');
    console.log('1. Abre EMAIL_SETUP.md');
    console.log('2. Sigue la opción de tu proveedor (Gmail, Outlook, etc)');
    console.log('3. Actualiza las variables en .env');
    console.log('4. Ejecuta este script nuevamente\n');
    process.exit(1);
  }

  try {
    console.log('📧 Enviando email de test...\n');

    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoicGFzc3dvcmRfcmVzZXQiLCJpYXQiOjE3MTY4MDAwMDAsImV4cCI6MTcxNjgwMTgwMH0.test123';

    // Simular envío de email
    const result = await sendPasswordResetEmail(
      'test@example.com',
      testToken,
      'Test User'
    );

    console.log('✅ Test completado!\n');
    console.log('Resultado:');
    console.log(`  Message ID: ${result.messageId || 'N/A'}`);
    console.log(`  Timestamp: ${new Date().toISOString()}\n`);

    console.log('✅ Email service está funcionando correctamente');
    console.log('\nProximos pasos:');
    console.log('1. Verifica tu bandeja de entrada');
    console.log('2. Si no ves el email, revisa la carpeta de spam');
    console.log('3. Si hay error, verifica credenciales en .env\n');

  } catch (error) {
    console.error('❌ Error al enviar email:\n');
    console.error(`  ${error.message}\n`);

    if (error.message.includes('Invalid login')) {
      console.log('💡 Posibles causas:');
      console.log('  - Credenciales incorrectas');
      console.log('  - Para Gmail: Usa App Password, no tu contraseña');
      console.log('  - Usuario y password no coinciden\n');
    }

    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Posibles causas:');
      console.log('  - SMTP_HOST incorrecto');
      console.log('  - SMTP_PORT incorrecto');
      console.log('  - Sin conexión a internet\n');
    }

    process.exit(1);
  }
};

testEmail();
