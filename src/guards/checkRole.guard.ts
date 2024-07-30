import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';

export async function chechRoleGuard(req: ExpressRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'admin') return next();

  res.status(401).json({ message: 'You do not have the necessary permission.' });
}
