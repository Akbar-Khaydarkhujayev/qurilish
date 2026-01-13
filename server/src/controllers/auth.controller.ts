import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { generateToken } from '../utils/jwt';
import { AuthRequest, User } from '../types';
import * as responseFormatter from '../utils/responseFormatter';

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, email, firstName, lastName, organizationId } = req.body;

    // Validation
    if (!username || !password || !name || !organizationId) {
      responseFormatter.badRequest(res, 'Username, password, name, and organization ID are required');
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

    // Check if email exists (if provided)
    if (email) {
      const emailExists = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE',
        [email]
      );

      if (emailExists.rows.length > 0) {
        responseFormatter.conflict(res, 'Email already exists');
        return;
      }
    }

    // Verify organization exists
    const orgCheck = await pool.query(
      'SELECT id FROM organizations WHERE id = $1 AND is_deleted = FALSE',
      [organizationId]
    );

    if (orgCheck.rows.length === 0) {
      responseFormatter.badRequest(res, 'Invalid organization ID');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, username, password, email, first_name, last_name, organization_id, role, user_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, username, email, first_name, last_name, organization_id, role, user_type, created_at`,
      [name, username, hashedPassword, email || null, firstName || null, lastName || null, organizationId, 'User', 'User']
    );

    const user = result.rows[0];
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    });

    responseFormatter.created(res, {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id,
        role: user.role,
        userType: user.user_type,
      },
      accessToken: token,
    }, 'User registered successfully');
  } catch (error) {
    console.error('Sign up error:', error);
    responseFormatter.error(res, 'Server error during sign up');
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      responseFormatter.badRequest(res, 'Username and password are required');
      return;
    }

    // Find user by username
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND is_deleted = FALSE',
      [username]
    );

    if (result.rows.length === 0) {
      responseFormatter.unauthorized(res, 'Invalid credentials');
      return;
    }

    const user: User = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      responseFormatter.unauthorized(res, 'Invalid credentials');
      return;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
    });

    responseFormatter.success(res, {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationId: user.organization_id,
        role: user.role,
        userType: user.user_type,
      },
      accessToken: token,
    }, 'Sign in successful');
  } catch (error) {
    console.error('Sign in error:', error);
    responseFormatter.error(res, 'Server error during sign in');
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      responseFormatter.unauthorized(res);
      return;
    }

    const result = await pool.query(
      `SELECT id, name, username, email, first_name, last_name, organization_id, role, user_type, created_at
       FROM users WHERE id = $1 AND is_deleted = FALSE`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      responseFormatter.notFound(res, 'User not found');
      return;
    }

    const user = result.rows[0];

    responseFormatter.success(res, {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      organizationId: user.organization_id,
      role: user.role,
      userType: user.user_type,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Get me error:', error);
    responseFormatter.error(res, 'Server error fetching user data');
  }
};
