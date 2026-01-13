import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { verifyToken } from '../utils/jwt';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (roles.length && !roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

// Helper to check if user can create another user based on role hierarchy
export const canCreateUser = (creatorRole: UserRole, targetRole: UserRole): boolean => {
  // super_admin can only create region_admin
  if (creatorRole === 'super_admin') {
    return targetRole === 'region_admin';
  }
  // region_admin can only create user
  if (creatorRole === 'region_admin') {
    return targetRole === 'user';
  }
  // user cannot create any users
  return false;
};
