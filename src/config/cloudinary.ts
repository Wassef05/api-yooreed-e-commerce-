import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'der34odrm',
  api_key: process.env.CLOUDINARY_API_KEY || '741272294384527',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GDTPotbDR27tDm4I1A2FKrlSUZs',
});

// Configuration du stockage en mémoire pour Multer
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image (JPEG, JPG, PNG, GIF, WEBP) et vidéo (MP4, MOV, AVI) sont autorisés'));
    }
  },
});

// Fonction pour supprimer une image de Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

// Fonction pour uploader une image et retourner l'URL
export const uploadImage = async (file: Express.Multer.File): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'yooreed-event',
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    );

    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

// Fonction pour uploader une vidéo
export const uploadVideo = async (file: Express.Multer.File): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'yooreed-event',
        resource_type: 'video',
        transformation: [
          { quality: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
        }
      }
    );

    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

// Fonction pour uploader depuis une URL
export const uploadFromUrl = async (url: string, folder?: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: folder || 'yooreed-event',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
    return result.secure_url;
  } catch (error) {
    console.error('Erreur lors de l\'upload depuis URL:', error);
    throw error;
  }
};

export default cloudinary;

