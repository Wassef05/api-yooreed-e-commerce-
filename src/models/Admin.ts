import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AdminRole = 'admin' | 'super_admin';

export interface IAdmin extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  nomComplet?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  createdAt: Date;
  lastLogin: Date | null;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est requis'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
    },
    role: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
    nomComplet: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    ville: {
      type: String,
      trim: true,
    },
    codePostal: {
      type: String,
      trim: true,
    },
    pays: {
      type: String,
      trim: true,
      default: 'Tunisie',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hashage du mot de passe avant sauvegarde
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour comparer les mots de passe
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

