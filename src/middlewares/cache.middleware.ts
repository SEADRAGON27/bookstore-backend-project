import { NextFunction, Response } from 'express';
import { Redis } from 'ioredis';
import { ExpressRequest } from '../interfaces/expressRequest.interface';

export async function cacheMiddleware(req: ExpressRequest, res: Response, next: NextFunction) {
  const key = req.originalUrl;
  const userId = req.user ? req.user.id : null;
  const clientRedis = new Redis();

  if (userId) return next();

  try {
    const data = await clientRedis.get(key);

    if (data) {
      res.header('Content-Type', 'application/json');

      return res.status(200).send(data);
    }

    next();
  } catch (error) {
    next(error);
  }
}
