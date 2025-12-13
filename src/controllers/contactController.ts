import { Request, Response, NextFunction } from 'express';
import { sendEmail } from '../config/email.js';
import { AppError } from '../middleware/errorHandler.js';

export const sendContactMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nom, email, telephone, sujet, message } = req.body;

    if (!nom || !email || !message) {
      throw new AppError('Nom, email et message requis', 400);
    }

    // Email au client
    const clientEmailHtml = `
      <h2>Confirmation de réception</h2>
      <p>Bonjour ${nom},</p>
      <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
      <p>Cordialement,<br>L'équipe Yooreed Event</p>
    `;

    // Email à l'administrateur
    const adminEmailHtml = `
      <h2>Nouveau message de contact</h2>
      <p><strong>Nom:</strong> ${nom}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${telephone || 'Non renseigné'}</p>
      <p><strong>Sujet:</strong> ${sujet || 'Sans sujet'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '';

    try {
      await sendEmail(
        email,
        'Confirmation de réception - Yooreed Event',
        clientEmailHtml
      );

      if (adminEmail) {
        await sendEmail(
          adminEmail,
          `Nouveau message de contact - ${sujet || 'Sans sujet'}`,
          adminEmailHtml
        );
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas faire échouer la requête si l'email échoue
    }

    res.json({
      success: true,
      message: 'Message envoyé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

