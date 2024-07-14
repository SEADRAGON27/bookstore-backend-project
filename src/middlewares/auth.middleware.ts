import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { JwtDecodedData } from '../types/jwtDecodedData.type';

export async function authMiddleware(req: ExpressRequest, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    req.user = null;

    return next();
  }

  try {
    const token = accessToken.split(' ')?.[1];
    const decodedAccessToken = verify(token, process.env.SECRET_PHRASE_ACCESS_TOKEN) as JwtPayload;
    req.user = decodedAccessToken as JwtDecodedData;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}
