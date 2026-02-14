import path from "path";
import fs from "fs";
import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";
import * as responseFormatter from "../utils/responseFormatter";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload multiple images for a building (object_card)
 */
export const uploadImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { objectCardId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      responseFormatter.badRequest(res, "No images provided");
      return;
    }

    // Verify object card exists
    const cardCheck = await pool.query(
      "SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE",
      [objectCardId],
    );
    if (cardCheck.rows.length === 0) {
      responseFormatter.notFound(res, "Object card not found");
      return;
    }

    // Get current max sort_order
    const maxOrderResult = await pool.query(
      "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM building_images WHERE object_card_id = $1 AND is_deleted = FALSE",
      [objectCardId],
    );
    let sortOrder = parseInt(maxOrderResult.rows[0].max_order) + 1;

    const insertedImages = [];

    for (const file of files) {
      const filePath = `/uploads/${file.filename}`;
      const result = await pool.query(
        `INSERT INTO building_images (object_card_id, path, file_name, sort_order)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [objectCardId, filePath, file.originalname, sortOrder],
      );
      insertedImages.push(result.rows[0]);
      sortOrder++;
    }

    responseFormatter.created(
      res,
      insertedImages,
      `${insertedImages.length} image(s) uploaded successfully`,
    );
  } catch (error) {
    console.error("Upload building images error:", error);
    responseFormatter.error(res, "Error uploading images");
  }
};

/**
 * Get all images for a building
 */
export const getImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const result = await pool.query(
      `SELECT * FROM building_images
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY sort_order ASC, created_at ASC`,
      [objectCardId],
    );

    responseFormatter.success(
      res,
      result.rows,
      "Building images retrieved successfully",
    );
  } catch (error) {
    console.error("Get building images error:", error);
    responseFormatter.error(res, "Error retrieving building images");
  }
};

/**
 * Delete a building image (soft delete)
 */
export const deleteImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { imageId } = req.params;

    const result = await pool.query(
      "UPDATE building_images SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING *",
      [imageId],
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, "Image not found");
      return;
    }

    responseFormatter.success(res, null, "Image deleted successfully");
  } catch (error) {
    console.error("Delete building image error:", error);
    responseFormatter.error(res, "Error deleting image");
  }
};
