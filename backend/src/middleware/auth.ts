import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { prisma } from '../db/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError('Authentication required. Please provide a valid Bearer token.', 401, 'AUTH_REQUIRED'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

// Allows ADMIN and SUPER_ADMIN — also checks AdminProfile.isRevoked
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Access denied. Administrator privileges required.', 403, 'FORBIDDEN'));
  }
  try {
    const profile = await prisma.adminProfile.findUnique({
      where: { userId: req.user.id },
      select: { isRevoked: true },
    });
    if (profile?.isRevoked) {
      return next(new AppError('Your admin access has been revoked. Contact a super admin.', 403, 'ACCESS_REVOKED'));
    }
    next();
  } catch (err) {
    next(err);
  }
}

// Only SUPER_ADMIN role — does NOT need separate revocation check (requireAdmin already ran first)
export function requireSuperAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    return next(new AppError('Access denied. Super administrator privileges required.', 403, 'FORBIDDEN'));
  }
  next();
}

export function requireContributor(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'AUTH_REQUIRED'));
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'CONTRIBUTOR') {
    return next(new AppError('Access denied. Contributor or Administrator privileges required.', 403, 'FORBIDDEN'));
  }
  next();
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
