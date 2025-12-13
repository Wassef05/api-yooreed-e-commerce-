import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  nom: string;
  slug: string;
  description: string;
  parentId: mongoose.Types.ObjectId | null;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est requis'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: [true, 'Le slug est requis'],
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la hiérarchie
CategorySchema.index({ parentId: 1, slug: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

