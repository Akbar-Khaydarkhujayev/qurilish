import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['file_name', 'path'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE files.is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM files ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        files.*,
        object_card.object_name,
        object_card.card_number
       FROM files
       LEFT JOIN object_card ON files.object_card_id = object_card.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Files retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get files error:', error);
    responseFormatter.error(res, 'Error retrieving files');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        files.*,
        object_card.object_name,
        object_card.card_number,
        object_card.address
       FROM files
       LEFT JOIN object_card ON files.object_card_id = object_card.id
       WHERE files.id = $1 AND files.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'File not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'File retrieved successfully');
  } catch (error) {
    console.error('Get file error:', error);
    responseFormatter.error(res, 'Error retrieving file');
  }
};

export const getByObjectCardId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.notFound(res, 'Object card not found');
      return;
    }

    const result = await pool.query(
      `SELECT * FROM files
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY created_at DESC`,
      [objectCardId]
    );

    responseFormatter.success(
      res,
      {
        files: result.rows,
        count: result.rows.length,
      },
      'Files retrieved successfully'
    );
  } catch (error) {
    console.error('Get files by object card error:', error);
    responseFormatter.error(res, 'Error retrieving files');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { object_card_id } = req.body;
    const file = req.file;

    if (!object_card_id) {
      responseFormatter.badRequest(res, 'Object card ID is required');
      return;
    }

    if (!file) {
      responseFormatter.badRequest(res, 'File is required');
      return;
    }

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [object_card_id]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object card ID');
      return;
    }

    const filePath = `/uploads/${file.filename}`;
    const fileName = file.originalname;

    const result = await pool.query(
      `INSERT INTO files (object_card_id, path, file_name)
       VALUES ($1, $2, $3) RETURNING *`,
      [object_card_id, filePath, fileName]
    );

    responseFormatter.created(res, result.rows[0], 'File uploaded successfully');
  } catch (error) {
    console.error('Create file error:', error);
    responseFormatter.error(res, 'Error uploading file');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { object_card_id, path, file_name } = req.body;

    if (!object_card_id || !path || !file_name) {
      responseFormatter.badRequest(res, 'Object card ID, path, and file name are required');
      return;
    }

    // Verify object card exists
    const objectCardCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [object_card_id]
    );

    if (objectCardCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid object card ID');
      return;
    }

    const result = await pool.query(
      `UPDATE files
       SET object_card_id = $1, path = $2, file_name = $3
       WHERE id = $4 AND is_deleted = FALSE
       RETURNING *`,
      [object_card_id, path, file_name, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'File not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'File updated successfully');
  } catch (error) {
    console.error('Update file error:', error);
    responseFormatter.error(res, 'Error updating file');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE files SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'File not found');
      return;
    }

    // TODO: In the future, implement actual file deletion from storage
    // For now, we just soft delete the database record

    responseFormatter.success(res, null, 'File deleted successfully');
  } catch (error) {
    console.error('Delete file error:', error);
    responseFormatter.error(res, 'Error deleting file');
  }
};

export const download = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'File not found');
      return;
    }

    const file = result.rows[0];
    const filePath = path.join(__dirname, '../..', file.path);

    if (!fs.existsSync(filePath)) {
      responseFormatter.notFound(res, 'File not found on disk');
      return;
    }

    res.download(filePath, file.file_name);
  } catch (error) {
    console.error('Download file error:', error);
    responseFormatter.error(res, 'Error downloading file');
  }
};
