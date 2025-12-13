import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export const validate = (validations: any[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((err) => err.msg);
    next(new AppError(errorMessages.join(', '), 400));
  };
};

// Validations pour l'authentification
export const validateLogin = validate([
  body('username').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
]);

// Validations pour les produits
export const validateProduct = validate([
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('categorie').notEmpty().withMessage('La catégorie est requise'),
  body('sousCategorie').notEmpty().withMessage('La sous-catégorie est requise'),
  body('description').notEmpty().withMessage('La description est requise'),
  body('prix').isNumeric().withMessage('Le prix doit être un nombre'),
  body('stock').isInt({ min: 0 }).withMessage('Le stock doit être un entier positif'),
]);

// Validations pour les catégories
export const validateCategory = validate([
  body('nom').notEmpty().withMessage('Le nom est requis'),
]);

// Validations pour les commandes
export const validateOrder = validate([
  body('client.nom').notEmpty().withMessage('Le nom du client est requis'),
  body('client.email').isEmail().withMessage('Email invalide'),
  body('client.telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('client.adresse').notEmpty().withMessage('L\'adresse est requise'),
  body('produits').isArray({ min: 1 }).withMessage('Au moins un produit est requis'),
]);

// Validations pour les devis
export const validateQuote = validate([
  body('client.nom').notEmpty().withMessage('Le nom du client est requis'),
  body('client.email').isEmail().withMessage('Email invalide'),
  body('client.telephone').notEmpty().withMessage('Le téléphone est requis'),
  body('client.adresse').notEmpty().withMessage('L\'adresse est requise'),
  body('produits').isArray({ min: 1 }).withMessage('Au moins un produit est requis'),
]);

// Validations pour le contact
export const validateContact = validate([
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('message').notEmpty().withMessage('Le message est requis'),
]);

