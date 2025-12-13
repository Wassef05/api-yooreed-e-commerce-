import express from 'express';
import { upload, uploadImage, uploadVideo } from '../config/cloudinary.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Upload d'une seule image
router.post(
  '/image',
  authenticate,
  authorize('admin', 'super_admin'),
  upload.single('image'),
  async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'Aucun fichier uploadé' },
        });
        return;
      }

      const result = await uploadImage(req.file);
      res.json({
        success: true,
        data: result,
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erreur lors de l\'upload' },
      });
      return;
    }
  }
);

// Upload de plusieurs images
router.post(
  '/images',
  authenticate,
  authorize('admin', 'super_admin'),
  upload.array('images', 10),
  async (req, res): Promise<void> => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          error: { message: 'Aucun fichier uploadé' },
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const uploadPromises = files.map((file) => uploadImage(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      res.json({
        success: true,
        data: { files: uploadedFiles },
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erreur lors de l\'upload' },
      });
      return;
    }
  }
);

// Upload d'une vidéo
router.post(
  '/video',
  authenticate,
  authorize('admin', 'super_admin'),
  upload.single('video'),
  async (req, res): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { message: 'Aucun fichier uploadé' },
        });
        return;
      }

      const result = await uploadVideo(req.file);
      res.json({
        success: true,
        data: result,
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erreur lors de l\'upload' },
      });
      return;
    }
  }
);

export default router;
