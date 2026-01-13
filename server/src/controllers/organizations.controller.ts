import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search, region_id } = req.query;

    const searchClause = buildSearchClause(['organizations.name', 'tax_id'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE organizations.is_deleted = FALSE';
    const params: any[] = [];

    // Filter by region if provided
    if (region_id) {
      whereClause += ` AND organizations.region_id = $${params.length + 1}`;
      params.push(region_id);
    }

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM organizations ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT organizations.*, regions.name as region_name
       FROM organizations
       LEFT JOIN regions ON organizations.region_id = regions.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    responseFormatter.success(res, result.rows, 'Organizations retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get organizations error:', error);
    responseFormatter.error(res, 'Error retrieving organizations');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT organizations.*, regions.name as region_name
       FROM organizations
       LEFT JOIN regions ON organizations.region_id = regions.id
       WHERE organizations.id = $1 AND organizations.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Organization not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Organization retrieved successfully');
  } catch (error) {
    console.error('Get organization error:', error);
    responseFormatter.error(res, 'Error retrieving organization');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, tax_id, region_id } = req.body;

    if (!name || !region_id) {
      responseFormatter.badRequest(res, 'Organization name and region ID are required');
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

    // Check for duplicate tax_id if provided
    if (tax_id) {
      const taxCheck = await pool.query(
        'SELECT id FROM organizations WHERE tax_id = $1 AND is_deleted = FALSE',
        [tax_id]
      );

      if (taxCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Organization with this tax ID already exists');
        return;
      }
    }

    const result = await pool.query(
      'INSERT INTO organizations (name, tax_id, region_id) VALUES ($1, $2, $3) RETURNING *',
      [name, tax_id || null, region_id]
    );

    responseFormatter.created(res, result.rows[0], 'Organization created successfully');
  } catch (error) {
    console.error('Create organization error:', error);
    responseFormatter.error(res, 'Error creating organization');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, tax_id, region_id } = req.body;

    if (!name || !region_id) {
      responseFormatter.badRequest(res, 'Organization name and region ID are required');
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

    // Check for duplicate tax_id if provided (excluding current organization)
    if (tax_id) {
      const taxCheck = await pool.query(
        'SELECT id FROM organizations WHERE tax_id = $1 AND id != $2 AND is_deleted = FALSE',
        [tax_id, id]
      );

      if (taxCheck.rows.length > 0) {
        responseFormatter.conflict(res, 'Organization with this tax ID already exists');
        return;
      }
    }

    const result = await pool.query(
      'UPDATE organizations SET name = $1, tax_id = $2, region_id = $3 WHERE id = $4 AND is_deleted = FALSE RETURNING *',
      [name, tax_id || null, region_id, id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Organization not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'Organization updated successfully');
  } catch (error) {
    console.error('Update organization error:', error);
    responseFormatter.error(res, 'Error updating organization');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if organization has users
    const usersCheck = await pool.query(
      'SELECT COUNT(*) FROM users WHERE organization_id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (parseInt(usersCheck.rows[0].count) > 0) {
      responseFormatter.badRequest(res, 'Cannot delete organization with active users');
      return;
    }

    const result = await pool.query(
      'UPDATE organizations SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'Organization not found');
      return;
    }

    responseFormatter.success(res, null, 'Organization deleted successfully');
  } catch (error) {
    console.error('Delete organization error:', error);
    responseFormatter.error(res, 'Error deleting organization');
  }
};
