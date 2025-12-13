import { Admin } from '../models/Admin.js';
import { connectDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await Admin.findOne({ username: 'admin' });

    if (adminExists) {
      console.log('✅ Admin par défaut existe déjà');
      process.exit(0);
    }

    const admin = new Admin({
      username: 'admin',
      email: 'admin@yooreed-event.com',
      passwordHash: 'admin123', // Sera hashé automatiquement par le pre-save hook
      role: 'super_admin',
    });

    await admin.save();
    console.log('✅ Admin par défaut créé avec succès');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Changez le mot de passe après la première connexion !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();

