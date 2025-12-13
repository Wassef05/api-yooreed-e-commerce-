import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail } from '../config/email.js';

export const createOrder = async (
  req: Request,
  res: Response,  
  next: NextFunction
): Promise<void> => {
  try {
    const { client, produits, instructions } = req.body;

    if (!client || !produits || produits.length === 0) {
      throw new AppError('Client et produits requis', 400);
    }

    // Vérifier les produits et calculer le total
    let total = 0;
    const orderProducts = [];

    for (const item of produits) {
      const product = await Product.findById(item.produitId);

      if (!product) {
        throw new AppError(`Produit ${item.produitId} non trouvé`, 404);
      }

      if (product.stock < item.quantite) {
        throw new AppError(
          `Stock insuffisant pour ${product.nom}`,
          400
        );
      }

      const prixUnitaire = product.prix;
      total += prixUnitaire * item.quantite;

      orderProducts.push({
        produitId: product._id,
        quantite: item.quantite,
        prixUnitaire,
        personnalisation: item.personnalisation || '',
      });
    }

    const order = new Order({
      client,
      produits: orderProducts,
      total,
      instructions: instructions || '',
    });

    await order.save();
    await order.populate('produits.produitId', 'nom images');

    // Envoyer email de confirmation au client
    try {
      const emailHtml = `
        <h2>Confirmation de commande</h2>
        <p>Bonjour ${client.nom},</p>
        <p>Votre commande <strong>${order.numeroCommande}</strong> a été enregistrée avec succès.</p>
        <p>Total: ${total} TND</p>
        <p>Nous vous contacterons sous peu pour finaliser votre commande.</p>
      `;
      await sendEmail(client.email, 'Confirmation de commande - Yooreed Event', emailHtml);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // Ne pas faire échouer la commande si l'email échoue
    }

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      statut,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (statut) {
      query.statut = statut;
    }

    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .populate('produits.produitId', 'nom images prix')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
      'produits.produitId',
      'nom images prix description'
    );

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const validStatuses = ['en_attente', 'en_traitement', 'expediee', 'annulee'];
    if (!validStatuses.includes(statut)) {
      throw new AppError('Statut invalide', 400);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { statut },
      { new: true, runValidators: true }
    ).populate('produits.produitId', 'nom images prix');

    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Envoyer email de notification si le statut change
    try {
      const statusMessages: Record<string, string> = {
        en_traitement: 'Votre commande est en cours de traitement',
        expediee: 'Votre commande a été expédiée',
        annulee: 'Votre commande a été annulée',
      };

      if (statusMessages[statut]) {
        const emailHtml = `
          <h2>Mise à jour de commande</h2>
          <p>Bonjour ${order.client.nom},</p>
          <p>${statusMessages[statut]}.</p>
          <p>Numéro de commande: <strong>${order.numeroCommande}</strong></p>
        `;
        await sendEmail(
          order.client.email,
          `Mise à jour commande ${order.numeroCommande}`,
          emailHtml
        );
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

