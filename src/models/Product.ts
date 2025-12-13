import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  nom: string;
  categorie: string;
  sousCategorie: string;
  description: string;
  descriptionTechnique: string;
  prix: number;
  images: string[];
  videos: string[];
  materiaux: string[];
  personnalisation: string[];
  recommandations: mongoose.Types.ObjectId[];
  stock: number;
  delaiLivraison: string;
  gravureLaser: boolean;
  resine: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      index: true,
    },
    categorie: {
      type: String,
      required: [true, 'La catégorie est requise'],
      index: true,
    },
    sousCategorie: {
      type: String,
      required: [true, 'La sous-catégorie est requise'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    descriptionTechnique: {
      type: String,
      default: '',
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    materiaux: {
      type: [String],
      default: [],
    },
    personnalisation: {
      type: [String],
      default: [],
    },
    recommandations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    stock: {
      type: Number,
      required: [true, 'Le stock est requis'],
      min: [0, 'Le stock ne peut pas être négatif'],
      default: 0,
    },
    delaiLivraison: {
      type: String,
      default: 'Sur demande',
    },
    gravureLaser: {
      type: Boolean,
      default: false,
      index: true,
    },
    resine: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches fréquentes
ProductSchema.index({ categorie: 1, sousCategorie: 1 });
ProductSchema.index({ nom: 'text', description: 'text' });
ProductSchema.index({ gravureLaser: 1, resine: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

