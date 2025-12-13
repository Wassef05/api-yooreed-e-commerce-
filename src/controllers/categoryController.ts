import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.js';
import { AppError } from '../middleware/errorHandler.js';

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ nom: 1 });

    // Organiser en hiérarchie
    const buildTree = (parentId: string | null): any[] => {
      return categories
        .filter((cat) => {
          if (parentId === null) {
            return !cat.parentId;
          }
          return cat.parentId?.toString() === parentId;
        })
        .map((cat: any) => ({
          ...cat.toObject(),
          children: buildTree(cat._id.toString()),
        }));
    };

    const tree = buildTree(null);

    res.json({
      success: true,
      data: { categories: tree, flat: categories },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      throw new AppError('Catégorie non trouvée', 404);
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nom, description, parentId, image } = req.body;

    if (!nom) {
      throw new AppError('Le nom de la catégorie est requis', 400);
    }

    const slug = slugify(nom);

    // Vérifier si le slug existe déjà
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      throw new AppError('Une catégorie avec ce nom existe déjà', 400);
    }

    const category = new Category({
      nom,
      slug,
      description: description || '',
      parentId: parentId || null,
      image: image || '',
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      next(new AppError('Une catégorie avec ce nom existe déjà', 400));
    } else {
      next(error);
    }
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nom, description, parentId, image } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      throw new AppError('Catégorie non trouvée', 404);
    }

    // Mettre à jour le slug si le nom change
    if (nom && nom !== category.nom) {
      const slug = slugify(nom);
      const existingCategory = await Category.findOne({
        slug,
        _id: { $ne: id },
      });

      if (existingCategory) {
        throw new AppError('Une catégorie avec ce nom existe déjà', 400);
      }

      category.slug = slug;
      category.nom = nom;
    }

    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId;
    if (image !== undefined) category.image = image;

    await category.save();

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des sous-catégories
    const hasChildren = await Category.findOne({ parentId: id });
    if (hasChildren) {
      throw new AppError(
        'Impossible de supprimer une catégorie qui a des sous-catégories',
        400
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new AppError('Catégorie non trouvée', 404);
    }

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};

