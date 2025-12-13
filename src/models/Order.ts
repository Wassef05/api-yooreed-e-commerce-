import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
  produitId: mongoose.Types.ObjectId;
  quantite: number;
  prixUnitaire: number;
  personnalisation?: string;
}

export interface IOrderClient {
  nom: string;
  societe: string;
  email: string;
  telephone: string;
  adresse: string;
}

export type OrderStatus = 'en_attente' | 'en_traitement' | 'expediee' | 'annulee';

export interface IOrder extends Document {
  numeroCommande: string;
  client: IOrderClient;
  produits: IOrderProduct[];
  total: number;
  statut: OrderStatus;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
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
  prixUnitaire: {
    type: Number,
    required: true,
    min: 0,
  },
  personnalisation: {
    type: String,
    default: '',
  },
});

const OrderClientSchema = new Schema<IOrderClient>({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  societe: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
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

const OrderSchema = new Schema<IOrder>(
  {
    numeroCommande: {
      type: String,
      required: false, // Sera généré automatiquement
      unique: true,
    },
    client: {
      type: OrderClientSchema,
      required: true,
    },
    produits: {
      type: [OrderProductSchema],
      required: true,
      validate: {
        validator: (v: IOrderProduct[]) => v.length > 0,
        message: 'Au moins un produit est requis',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'en_traitement', 'expediee', 'annulee'],
      default: 'en_attente',
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les recherches
// Note: numeroCommande a déjà un index unique créé par unique: true
OrderSchema.index({ statut: 1, createdAt: -1 });
OrderSchema.index({ 'client.email': 1 });

// Génération automatique du numéro de commande AVANT la validation
OrderSchema.pre('validate', async function (next) {
  if (!this.numeroCommande) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      this.numeroCommande = `CMD-${Date.now()}-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      // En cas d'erreur, générer un numéro basé sur le timestamp uniquement
      this.numeroCommande = `CMD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

