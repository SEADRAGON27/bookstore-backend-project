import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';

export async function authGuard(req: ExpressRequest, res: Response, next: NextFunction) {
  if (req.user) return next();

  res.status(401).json({ message: 'Not authorized' });
}
