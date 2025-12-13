import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  // Vérifier que la configuration email est complète
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Configuration email incomplète, email non envoyé');
    return;
  }

  try {
    const transporter = createTransporter();
    
    await transporter.verify();
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@yooreed-event.com',
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email sent to ${to}`);
  } catch (error: any) {
    console.error('❌ Error sending email:', error?.message || error);
    // Ne pas throw l'erreur pour ne pas bloquer les autres opérations
    // L'email est optionnel, on continue même en cas d'erreur
  }
};

