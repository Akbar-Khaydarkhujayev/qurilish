import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import * as stateCommissionController from '../controllers/state-commission.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.get(
  '/object-cards/:objectCardId/state-commission',
  authenticate,
  stateCommissionController.getByObjectCardId
);
router.post(
  '/object-cards/:objectCardId/state-commission',
  authenticate,
  upload.single('pdf_file'),
  stateCommissionController.save
);
router.delete(
  '/object-cards/:objectCardId/state-commission/pdf',
  authenticate,
  stateCommissionController.removePdf
);
router.get(
  '/object-cards/:objectCardId/state-commission/pdf/preview',
  authenticate,
  stateCommissionController.previewPdf
);
router.get(
  '/object-cards/:objectCardId/state-commission/pdf/download',
  authenticate,
  stateCommissionController.downloadPdf
);

export default router;
