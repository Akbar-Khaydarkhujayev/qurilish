import { Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { AuthRequest, UserRole } from '../types';
import * as responseFormatter from '../utils/responseFormatter';
import { parsePagination, buildOrderClause, calculateMeta, buildSearchClause } from '../utils/queryBuilder';
import { canCreateUser } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sort_by, sort_order, search } = req.query;

    const searchClause = buildSearchClause(['u.name', 'u.username'], search as string);
    const orderClause = buildOrderClause(sort_by as string, sort_order as string);

    let whereClause = 'WHERE u.is_deleted = FALSE';
    const params: any[] = [];

    if (searchClause.clause) {
      whereClause += ` AND ${searchClause.clause}`;
      params.push(...searchClause.params);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT
        u.id, u.name, u.username,
        u.organization_id, u.role, u.user_type, u.created_at, u.updated_at,
        o.name as organization_name
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       ${whereClause}
       ${orderClause.replace('ORDER BY ', 'ORDER BY u.')}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Transform data to include nested objects
    const users = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      username: row.username,
      organization_id: row.organization_id,
      organization: row.organization_id ? { id: row.organization_id, name: row.organization_name } : null,
      role: row.role,
      user_type: row.user_type,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    responseFormatter.success(res, users, 'Users retrieved successfully', 200, calculateMeta(page, limit, total));
  } catch (error) {
    console.error('Get users error:', error);
    responseFormatter.error(res, 'Error retrieving users');
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        u.id, u.name, u.username,
        u.organization_id, u.role, u.user_type, u.created_at, u.updated_at,
        o.name as organization_name
       FROM users u
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1 AND u.is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'User not found');
      return;
    }

    const row = result.rows[0];
    const user = {
      id: row.id,
      name: row.name,
      username: row.username,
      organization_id: row.organization_id,
      organization: row.organization_id ? { id: row.organization_id, name: row.organization_name } : null,
      role: row.role,
      user_type: row.user_type,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    responseFormatter.success(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get user error:', error);
    responseFormatter.error(res, 'Error retrieving user');
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const creator = req.user;
    if (!creator) {
      responseFormatter.unauthorized(res);
      return;
    }

    const { username, password, name, organization_id, role } = req.body;

    // Validation
    if (!username || !password || !name || !organization_id || !role) {
      responseFormatter.badRequest(res, 'Username, password, name, organization_id, and role are required');
      return;
    }

    // Validate role is one of the allowed values
    const validRoles: UserRole[] = ['super_admin', 'region_admin', 'user'];
    if (!validRoles.includes(role as UserRole)) {
      responseFormatter.badRequest(res, 'Invalid role. Must be one of: super_admin, region_admin, user');
      return;
    }

    // Check if creator can create this role
    if (!canCreateUser(creator.role as UserRole, role as UserRole)) {
      responseFormatter.forbidden(res, `${creator.role} cannot create ${role} users`);
      return;
    }

    // Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_deleted = FALSE',
      [username]
    );

    if (userExists.rows.length > 0) {
      responseFormatter.conflict(res, 'Username already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine user_type based on role
    const userType = role === 'super_admin' ? 'SuperAdmin' : role === 'region_admin' ? 'Admin' : 'Technical Supervisor';

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, username, password, organization_id, role, user_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, username, organization_id, role, user_type, created_at`,
      [name, username, hashedPassword, organization_id, role, userType]
    );

    responseFormatter.created(res, result.rows[0], 'User created successfully');
  } catch (error) {
    console.error('Create user error:', error);
    responseFormatter.error(res, 'Error creating user');
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, organization_id, role, password } = req.body;

    if (!name) {
      responseFormatter.badRequest(res, 'Name is required');
      return;
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_deleted = FALSE',
      [id]
    );

    if (existingUser.rows.length === 0) {
      responseFormatter.notFound(res, 'User not found');
      return;
    }

    // Determine user_type based on role
    const userType = role === 'super_admin' ? 'SuperAdmin' : role === 'region_admin' ? 'Admin' : 'Technical Supervisor';

    let query: string;
    let params: any[];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET
        name = $1, organization_id = $2, role = $3, user_type = $4, password = $5,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $6 AND is_deleted = FALSE
        RETURNING id, name, username, organization_id, role, user_type, created_at, updated_at`;
      params = [name, organization_id, role, userType, hashedPassword, id];
    } else {
      query = `UPDATE users SET
        name = $1, organization_id = $2, role = $3, user_type = $4,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND is_deleted = FALSE
        RETURNING id, name, username, organization_id, role, user_type, created_at, updated_at`;
      params = [name, organization_id, role, userType, id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'User not found');
      return;
    }

    responseFormatter.success(res, result.rows[0], 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    responseFormatter.error(res, 'Error updating user');
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'User not found');
      return;
    }

    responseFormatter.success(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    responseFormatter.error(res, 'Error deleting user');
  }
};
