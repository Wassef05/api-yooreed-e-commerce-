import { Request, Response, NextFunction } from 'express';
import { Admin } from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError('Nom d\'utilisateur et mot de passe requis', 400);
    }

    const admin = await Admin.findOne({ username: username.toLowerCase() });

    if (!admin) {
      throw new AppError('Identifiants invalides', 401);
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Identifiants invalides', 401);
    }

    // Mettre à jour la dernière connexion
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id.toString());

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin?.id) {
      throw new AppError('Non authentifié', 401);
    }

    const admin = await Admin.findById(req.admin.id).select('-passwordHash');

    if (!admin) {
      throw new AppError('Admin non trouvé', 404);
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          lastLogin: admin.lastLogin,
          nomComplet: admin.nomComplet,
          telephone: admin.telephone,
          adresse: admin.adresse,
          ville: admin.ville,
          codePostal: admin.codePostal,
          pays: admin.pays,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nomComplet, telephone, adresse, ville, codePostal, pays, email } = req.body;

    if (!req.admin?.id) {
      throw new AppError('Non autorisé', 401);
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      throw new AppError('Admin non trouvé', 404);
    }

    // Mettre à jour les champs fournis
    if (nomComplet !== undefined) admin.nomComplet = nomComplet;
    if (telephone !== undefined) admin.telephone = telephone;
    if (adresse !== undefined) admin.adresse = adresse;
    if (ville !== undefined) admin.ville = ville;
    if (codePostal !== undefined) admin.codePostal = codePostal;
    if (pays !== undefined) admin.pays = pays;
    if (email !== undefined) {
      // Vérifier que l'email n'est pas déjà utilisé par un autre admin
      const existingAdmin = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } });
      if (existingAdmin) {
        throw new AppError('Cet email est déjà utilisé', 400);
      }
      admin.email = email.toLowerCase();
    }

    await admin.save();

    const adminResponse = await Admin.findById(admin._id).select('-passwordHash');

    res.json({
      success: true,
      data: { admin: adminResponse },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Mot de passe actuel et nouveau mot de passe requis', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('Le nouveau mot de passe doit contenir au moins 6 caractères', 400);
    }

    if (!req.admin?.id) {
      throw new AppError('Non autorisé', 401);
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      throw new AppError('Admin non trouvé', 404);
    }

    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    admin.passwordHash = newPassword; // Sera hashé automatiquement par le pre-save hook
    await admin.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Avec JWT, la déconnexion est gérée côté client
    // On peut ajouter une blacklist de tokens si nécessaire
    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    next(error);
  }
};

