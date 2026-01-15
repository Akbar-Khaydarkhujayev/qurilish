import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import * as fileController from '../controllers/file.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// File routes
router.get('/files', authenticate, fileController.getAll);
router.post('/files', authenticate, upload.single('file'), fileController.create);
router.get('/files/:id', authenticate, fileController.getById);
router.get('/files/:id/download', authenticate, fileController.download);
router.put('/files/:id', authenticate, fileController.update);
router.delete('/files/:id', authenticate, fileController.remove);
router.get('/object-cards/:objectCardId/files', authenticate, fileController.getByObjectCardId);

export default router;
