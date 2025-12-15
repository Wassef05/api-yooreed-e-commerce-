import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      sousCategorie,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (category) {
      query.categorie = category;
    }

    if (sousCategorie) {
      query.sousCategorie = sousCategorie;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const sortOptions: any = {};
    sortOptions[sort as string] = order === 'asc' ? 1 : -1;

    // Debug logs
    console.log('📦 getProducts - Query:', JSON.stringify(query));
    console.log('📦 getProducts - MongoDB connection state:', mongoose.connection.readyState);
    console.log('📦 getProducts - Database name:', mongoose.connection.name);
    
    // Count total before query
    const total = await Product.countDocuments(query);
    console.log(`📦 getProducts - Total documents found: ${total}`);

    const products = await Product.find(query)
      .populate('recommandations', 'nom images prix')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    console.log(`📦 getProducts - Products returned: ${products.length}`);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('❌ getProducts error:', error);
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      'recommandations',
      'nom images prix description'
    );

    if (!product) {
      throw new AppError('Produit non trouvé', 404);
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category } = req.params;
    const { sousCategorie } = req.query;

    const query: any = { categorie: category };
    if (sousCategorie) {
      query.sousCategorie = sousCategorie;
    }

    const products = await Product.find(query).populate(
      'recommandations',
      'nom images prix'
    );

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productData = req.body;

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      next(new AppError('Un produit avec ce nom existe déjà', 400));
    } else {
      next(error);
    }
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('recommandations', 'nom images prix');

    if (!product) {
      throw new AppError('Produit non trouvé', 404);
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError('Produit non trouvé', 404);
    }

    res.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

