import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['name'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM construction_items ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM construction_items ${whereClause} ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Construction items retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get construction items error:', error);
    responseFormatter.error(res, 'Error retrieving construction items');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM construction_items WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Construction item not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Construction item retrieved successfully');
  } catch (error) {
    console.error('Get construction item error:', error);
    responseFormatter.error(res, 'Error retrieving construction item');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Item name is required');
      return;
    }

    // Check for duplicate name
    const duplicateCheck = await pool.query(
      'SELECT id FROM construction_items WHERE LOWER(name) = LOWER($1) AND is_deleted = FALSE',
      [name]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'Construction item with this name already exists');
      return;
    }

    const result = await pool.query(
      'INSERT INTO construction_items (name) VALUES ($1) RETURNING *',
      [name]
    );

    responseFormatter.created(res, result.rows[0], 'Construction item created successfully');
  } catch (error) {
    console.error('Create construction item error:', error);
    responseFormatter.error(res, 'Error creating construction item');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Item name is required');
      return;
    }

    // Check for duplicate name (excluding current item)
    const duplicateCheck = await pool.query(
      'SELECT id FROM construction_items WHERE LOWER(name) = LOWER($1) AND id != $2 AND is_deleted = FALSE',
      [name, id]
    );

    if (duplicateCheck.rows.length > 0) {
      responseFormatter.conflict(res, 'Construction item with this name already exists');
      return;
    }

    const result = await pool.query(
      'UPDATE construction_items SET name = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Construction item not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Construction item updated successfully');
  } catch (error) {
    console.error('Update construction item error:', error);
    responseFormatter.error(res, 'Error updating construction item');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if item is being used by any sub-object card items
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM sub_object_card_item WHERE construction_item_id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      responseFormatter.badRequest(res, 'Cannot delete construction item that is in use');
      return;
    }

    const result = await pool.query(
      'UPDATE construction_items SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Construction item not found');
      return;
    }

    responseFormatter.success(res, null, 'Construction item deleted successfully');
  } catch (error) {
    console.error('Delete construction item error:', error);
    responseFormatter.error(res, 'Error deleting construction item');
  }
};
