import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search, region_id } = req.query;

    const searchClause = buildSearchClause(['name'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE districts.is_deleted = FALSE';
    const params: any[] = [];

    // Filter by region if provided
    if (region_id) {
      whereClause += ` AND region_id = $${params.length + 1}`;
      params.push(region_id);
    }

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM districts ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT districts.*, regions.name as region_name
       FROM districts
       LEFT JOIN regions ON districts.region_id = regions.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Districts retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get districts error:', error);
    responseFormatter.error(res, 'Error retrieving districts');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT districts.*, regions.name as region_name
       FROM districts
       LEFT JOIN regions ON districts.region_id = regions.id
       WHERE districts.id = $1 AND districts.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'District not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'District retrieved successfully');
  } catch (error) {
    console.error('Get district error:', error);
    responseFormatter.error(res, 'Error retrieving district');
  }
};

export const getByRegionId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { regionId } = req.params;

    const result = await pool.query(
      `SELECT districts.*, regions.name as region_name
       FROM districts
       LEFT JOIN regions ON districts.region_id = regions.id
       WHERE districts.region_id = $1 AND districts.is_deleted = FALSE
       ORDER BY districts.name ASC`,
      [regionId]
    );

    responseFormatter.success(res, result.rows, 'Districts retrieved successfully');
  } catch (error) {
    console.error('Get districts by region error:', error);
    responseFormatter.error(res, 'Error retrieving districts');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, region_id } = req.body;

    if (!name || !region_id) {
      responseFormatter.badRequest(res, 'District name and region ID are required');
      return;
    }

    // Check if region exists
    const regionCheck = await pool.query(
      'SELECT id FROM regions WHERE id = $1 AND is_deleted = FALSE',
      [region_id]
    );

    if (regionCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid region ID');
      return;
    }

    const result = await pool.query(
      'INSERT INTO districts (name, region_id) VALUES ($1, $2) RETURNING *',
      [name, region_id]
    );

    responseFormatter.created(res, result.rows[0], 'District created successfully');
  } catch (error) {
    console.error('Create district error:', error);
    responseFormatter.error(res, 'Error creating district');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, region_id } = req.body;

    if (!name || !region_id) {
      responseFormatter.badRequest(res, 'District name and region ID are required');
      return;
    }

    // Check if region exists
    const regionCheck = await pool.query(
      'SELECT id FROM regions WHERE id = $1 AND is_deleted = FALSE',
      [region_id]
    );

    if (regionCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid region ID');
      return;
    }

    const result = await pool.query(
      'UPDATE districts SET name = $1, region_id = $2 WHERE id = $3 AND is_deleted = FALSE RETURNING *',
      [name, region_id, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'District not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'District updated successfully');
  } catch (error) {
    console.error('Update district error:', error);
    responseFormatter.error(res, 'Error updating district');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE districts SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'District not found');
      return;
    }

    responseFormatter.success(res, null, 'District deleted successfully');
  } catch (error) {
    console.error('Delete district error:', error);
    responseFormatter.error(res, 'Error deleting district');
  }
};
