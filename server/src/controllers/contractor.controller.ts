import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['name', 'tax_id', 'address', 'phone_number'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM contractor ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM contractor ${whereClause} ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Contractors retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get contractors error:', error);
    responseFormatter.error(res, 'Error retrieving contractors');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM contractor WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contractor not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Contractor retrieved successfully');
  } catch (error) {
    console.error('Get contractor error:', error);
    responseFormatter.error(res, 'Error retrieving contractor');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, tax_id, address, phone_number, mfo } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Contractor name is required');
      return;
    }

    // Check for duplicate tax_id if provided
    if (tax_id) {
      const taxCheck = await pool.query(
        'SELECT id FROM contractor WHERE tax_id = $1 AND is_deleted = FALSE',
        [tax_id]
      );

      if (taxCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Contractor with this tax ID already exists');
        return;
      }
    }

    const result = await pool.query(
      `INSERT INTO contractor (name, tax_id, address, phone_number, mfo)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, tax_id || null, address || null, phone_number || null, mfo || null]
    );

    responseFormatter.created(res, result.rows[0], 'Contractor created successfully');
  } catch (error) {
    console.error('Create contractor error:', error);
    responseFormatter.error(res, 'Error creating contractor');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, tax_id, address, phone_number, mfo } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Contractor name is required');
      return;
    }

    // Check for duplicate tax_id if provided (excluding current contractor)
    if (tax_id) {
      const taxCheck = await pool.query(
        'SELECT id FROM contractor WHERE tax_id = $1 AND id != $2 AND is_deleted = FALSE',
        [tax_id, id]
      );

      if (taxCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Contractor with this tax ID already exists');
        return;
      }
    }

    const result = await pool.query(
      `UPDATE contractor
       SET name = $1, tax_id = $2, address = $3, phone_number = $4, mfo = $5
       WHERE id = $6 AND is_deleted = FALSE
       RETURNING *`,
      [name, tax_id || null, address || null, phone_number || null, mfo || null, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contractor not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Contractor updated successfully');
  } catch (error) {
    console.error('Update contractor error:', error);
    responseFormatter.error(res, 'Error updating contractor');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if contractor is being used by any object cards
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM object_card WHERE contractor_id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      responseFormatter.badRequest(res, 'Cannot delete contractor that is in use');
      return;
    }

    const result = await pool.query(
      'UPDATE contractor SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Contractor not found');
      return;
    }

    responseFormatter.success(res, null, 'Contractor deleted successfully');
  } catch (error) {
    console.error('Delete contractor error:', error);
    responseFormatter.error(res, 'Error deleting contractor');
  }
};
