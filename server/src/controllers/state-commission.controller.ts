import path from 'path';
import fs from 'fs';
import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';

export const getByObjectCardId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const result = await pool.query(
      `SELECT * FROM state_commission
       WHERE object_card_id = $1 AND is_deleted = FALSE
       ORDER BY id DESC LIMIT 1`,
      [objectCardId]
    );

    responseFormatter.success(res, result.rows[0] || null, 'State commission retrieved successfully');
  } catch (error) {
    console.error('Get state commission error:', error);
    responseFormatter.error(res, 'Error retrieving state commission');
  }
};

export const save = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;
    const { document_number, document_date, comment } = req.body;
    const file = req.file;

    // Check building exists
    const buildingCheck = await pool.query(
      'SELECT id FROM object_card WHERE id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (buildingCheck.rows.length === 0) {
      responseFormatter.notFound(res, 'Building not found');
      return;
    }

    // Get existing commission
    const existing = await pool.query(
      'SELECT * FROM state_commission WHERE object_card_id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    let pdfFilePath: string | null = existing.rows[0]?.pdf_file_path || null;
    let pdfFileName: string | null = existing.rows[0]?.pdf_file_name || null;

    if (file) {
      // Delete old file if it exists on disk
      if (pdfFilePath) {
        const oldPath = path.join(__dirname, '../..', pdfFilePath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      pdfFilePath = `/uploads/${file.filename}`;
      pdfFileName = file.originalname;
    }

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE state_commission
         SET document_number = $1, document_date = $2, comment = $3,
             pdf_file_path = $4, pdf_file_name = $5, updated_at = CURRENT_TIMESTAMP
         WHERE object_card_id = $6 AND is_deleted = FALSE
         RETURNING *`,
        [document_number || null, document_date || null, comment || null, pdfFilePath, pdfFileName, objectCardId]
      );
    } else {
      result = await pool.query(
        `INSERT INTO state_commission (object_card_id, document_number, document_date, comment, pdf_file_path, pdf_file_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [objectCardId, document_number || null, document_date || null, comment || null, pdfFilePath, pdfFileName]
      );
    }

    const commission = result.rows[0];

    // Auto-complete building if all fields are filled
    const allFilled = commission.document_number && commission.document_date &&
                      commission.comment && commission.pdf_file_path;

    if (allFilled) {
      const completedStatus = await pool.query(
        `SELECT id FROM construction_status
         WHERE sequence = (SELECT MAX(sequence) FROM construction_status WHERE is_deleted = FALSE)
         AND is_deleted = FALSE`
      );

      if (completedStatus.rows.length > 0) {
        await pool.query(
          `UPDATE object_card SET construction_status_id = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND is_deleted = FALSE`,
          [completedStatus.rows[0].id, objectCardId]
        );
      }
    }

    responseFormatter.success(res, commission, 'State commission saved successfully');
  } catch (error) {
    console.error('Save state commission error:', error);
    responseFormatter.error(res, 'Error saving state commission');
  }
};

export const removePdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const existing = await pool.query(
      'SELECT * FROM state_commission WHERE object_card_id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (existing.rows.length === 0 || !existing.rows[0].pdf_file_path) {
      responseFormatter.notFound(res, 'PDF not found');
      return;
    }

    const filePath = path.join(__dirname, '../..', existing.rows[0].pdf_file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query(
      `UPDATE state_commission
       SET pdf_file_path = NULL, pdf_file_name = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE object_card_id = $1 AND is_deleted = FALSE`,
      [objectCardId]
    );

    responseFormatter.success(res, null, 'PDF removed successfully');
  } catch (error) {
    console.error('Remove PDF error:', error);
    responseFormatter.error(res, 'Error removing PDF');
  }
};

export const previewPdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const result = await pool.query(
      'SELECT * FROM state_commission WHERE object_card_id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (result.rows.length === 0 || !result.rows[0].pdf_file_path) {
      responseFormatter.notFound(res, 'PDF not found');
      return;
    }

    const commission = result.rows[0];
    const filePath = path.join(__dirname, '../..', commission.pdf_file_path);

    if (!fs.existsSync(filePath)) {
      responseFormatter.notFound(res, 'PDF file not found on disk');
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(commission.pdf_file_name)}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Preview PDF error:', error);
    responseFormatter.error(res, 'Error previewing PDF');
  }
};

export const downloadPdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { objectCardId } = req.params;

    const result = await pool.query(
      'SELECT * FROM state_commission WHERE object_card_id = $1 AND is_deleted = FALSE',
      [objectCardId]
    );

    if (result.rows.length === 0 || !result.rows[0].pdf_file_path) {
      responseFormatter.notFound(res, 'PDF not found');
      return;
    }

    const commission = result.rows[0];
    const filePath = path.join(__dirname, '../..', commission.pdf_file_path);

    if (!fs.existsSync(filePath)) {
      responseFormatter.notFound(res, 'PDF file not found on disk');
      return;
    }

    res.download(filePath, commission.pdf_file_name);
  } catch (error) {
    console.error('Download PDF error:', error);
    responseFormatter.error(res, 'Error downloading PDF');
  }
};
