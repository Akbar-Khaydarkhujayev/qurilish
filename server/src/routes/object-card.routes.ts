import path from "path";
import multer from "multer";
import { Router } from "express";
import * as objectCardController from "../controllers/object-card.controller";
import * as buildingImageController from "../controllers/building-image.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Configure multer for building images
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowed.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Object Card routes
router.get("/object-cards", authenticate, objectCardController.getAll);
router.post("/object-cards", authenticate, objectCardController.create);
router.get("/object-cards/:id", authenticate, objectCardController.getById);
router.get(
  "/object-cards/:id/summary",
  authenticate,
  objectCardController.getSummary,
);
router.put("/object-cards/:id", authenticate, objectCardController.update);
router.delete("/object-cards/:id", authenticate, objectCardController.remove);

// Building image routes
router.get(
  "/object-cards/:objectCardId/images",
  authenticate,
  buildingImageController.getImages,
);
router.post(
  "/object-cards/:objectCardId/images",
  authenticate,
  upload.array("images", 20),
  buildingImageController.uploadImages,
);
router.delete(
  "/building-images/:imageId",
  authenticate,
  buildingImageController.deleteImage,
);

export default router;
