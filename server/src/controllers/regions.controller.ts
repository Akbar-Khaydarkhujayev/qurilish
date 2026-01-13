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
      `SELECT COUNT(*) FROM regions ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM regions ${whereClause} ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Regions retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get regions error:', error);
    responseFormatter.error(res, 'Error retrieving regions');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM regions WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Region not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Region retrieved successfully');
  } catch (error) {
    console.error('Get region error:', error);
    responseFormatter.error(res, 'Error retrieving region');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Region name is required');
      return;
    }

    const result = await pool.query(
      'INSERT INTO regions (name) VALUES ($1) RETURNING *',
      [name]
    );

    responseFormatter.created(res, result.rows[0], 'Region created successfully');
  } catch (error) {
    console.error('Create region error:', error);
    responseFormatter.error(res, 'Error creating region');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Region name is required');
      return;
    }

    const result = await pool.query(
      'UPDATE regions SET name = $1 WHERE id = $2 AND is_deleted = FALSE RETURNING *',
      [name, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Region not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Region updated successfully');
  } catch (error) {
    console.error('Update region error:', error);
    responseFormatter.error(res, 'Error updating region');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE regions SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Region not found');
      return;
    }

    responseFormatter.success(res, null, 'Region deleted successfully');
  } catch (error) {
    console.error('Delete region error:', error);
    responseFormatter.error(res, 'Error deleting region');
  }
};
