import mongoose, { Schema, Document } from 'mongoose';

export interface IQuoteProduct {
  produitId: mongoose.Types.ObjectId;
  quantite: number;
  besoinsSpecifiques: string;
}

export interface IQuoteClient {
  nom: string;
  societe: string;
  email: string;
  telephone: string;
  adresse: string;
}

export type QuoteStatus = 'en_cours' | 'traite';

export interface IQuote extends Document {
  numeroDevis: string;
  client: IQuoteClient;
  produits: IQuoteProduct[];
  statut: QuoteStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuoteProductSchema = new Schema<IQuoteProduct>({
  produitId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantite: {
    type: Number,
    required: true,
    min: 1,
  },
  besoinsSpecifiques: {
    type: String,
    default: '',
  },
});

const QuoteClientSchema = new Schema<IQuoteClient>({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  societe: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true,
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise'],
    trim: true,
  },
});

const QuoteSchema = new Schema<IQuote>(
  {
    numeroDevis: {
      type: String,
      required: false, // Sera généré automatiquement
      unique: true,
    },
    client: {
      type: QuoteClientSchema,
      required: true,
    },
    produits: {
      type: [QuoteProductSchema],
      required: true,
      validate: {
        validator: (v: IQuoteProduct[]) => v.length > 0,
        message: 'Au moins un produit est requis',
      },
    },
    statut: {
      type: String,
      enum: ['en_cours', 'traite'],
      default: 'en_cours',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches
// Note: numeroDevis a déjà un index unique créé par unique: true
QuoteSchema.index({ statut: 1, createdAt: -1 });
QuoteSchema.index({ 'client.email': 1 });

// Génération automatique du numéro de devis AVANT la validation
QuoteSchema.pre('validate', async function (next) {
  if (!this.numeroDevis) {
    try {
      const count = await mongoose.model('Quote').countDocuments();
      this.numeroDevis = `DEV-${Date.now()}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // En cas d'erreur, générer un numéro basé sur le timestamp uniquement
      this.numeroDevis = `DEV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  }
  next();
});

export const Quote = mongoose.model<IQuote>('Quote', QuoteSchema);

