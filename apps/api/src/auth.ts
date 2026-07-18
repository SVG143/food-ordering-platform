import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from './models.js';

export interface AuthRequest extends Request { user?: { id: string; role: Role } }

export const signToken = (id: string, role: Role) => jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: Role };
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired token' }); }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin access required' });
