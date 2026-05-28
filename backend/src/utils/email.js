import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configurar transporte de email
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Verificar conexión de email (solo en desarrollo)
 */
if (process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('⚠️ Email configuration error:', error.message);
      console.log('💡 Configuración de email no disponible. Usando modo desarrollo.');
    } else {
      console.log('✅ Email service is ready');
    }
  });
}

/**
 * Enviar email de reset de contraseña
 */
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: '🔐 Recuperar tu contraseña - Catering PYME',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #E63946, #D62828); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🍽️ Catering PYME</h1>
          </div>

          <div style="background: #f5f5f5; padding: 40px 20px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333333; margin-top: 0;">Hola ${userName || 'Usuario'},</h2>

            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
              Hemos recibido una solicitud para recuperar tu contraseña. 
              Si no fuiste tú, puedes ignorar este email.
            </p>

            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
              Para resetear tu contraseña, haz click en el botón de abajo. 
              <strong>Este link es válido por 30 minutos.</strong>
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #E63946; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                🔐 Recuperar Contraseña
              </a>
            </div>

            <p style="color: #999999; font-size: 14px; line-height: 1.6;">
              O copia y pega este link en tu navegador:<br/>
              <code style="background: white; padding: 10px; border: 1px solid #ddd; 
                          display: block; word-break: break-all; margin-top: 10px;">
                ${resetLink}
              </code>
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999999; font-size: 12px;">
              🔐 <strong>Seguridad:</strong> Nunca compartiremos tu contraseña. 
              Si no solicitaste este email, contacta a nuestro soporte.
            </p>

            <p style="color: #999999; font-size: 12px; margin-bottom: 0;">
              © 2026 Catering PYME. Todos los derechos reservados.
            </p>
          </div>
        </div>
      `,
      text: `
Hola ${userName || 'Usuario'},

Hemos recibido una solicitud para recuperar tu contraseña.
Si no fuiste tú, puedes ignorar este email.

Para resetear tu contraseña, abre este link (válido por 30 minutos):
${resetLink}

Si tienes problemas, contacta a nuestro soporte.

© 2026 Catering PYME.
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Error al enviar email de reset');
  }
};

/**
 * Enviar email de bienvenida (opcional)
 */
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: '🎉 ¡Bienvenido a Catering PYME!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #E63946, #D62828); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🍽️ Catering PYME</h1>
          </div>

          <div style="background: #f5f5f5; padding: 40px 20px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333333; margin-top: 0;">¡Bienvenido, ${userName}!</h2>

            <p style="color: #666666; font-size: 16px; line-height: 1.6;">
              Tu cuenta ha sido creada exitosamente. Ya puedes acceder a Catering PYME 
              y explorar nuestro catálogo de productos.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/login" 
                 style="background-color: #E63946; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; 
                        display: inline-block; font-size: 16px;">
                📱 Ir a Mi Cuenta
              </a>
            </div>

            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              <strong>Características:</strong>
              ✓ Catálogo completo de productos<br/>
              ✓ Chat en tiempo real con soporte<br/>
              ✓ Historial de pedidos<br/>
              ✓ Notificaciones personalizadas
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999999; font-size: 12px;">
              Si tienes preguntas, no dudes en contactarnos.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    // No fallar si el email no se envía
    return null;
  }
};

export default { sendPasswordResetEmail, sendWelcomeEmail };
