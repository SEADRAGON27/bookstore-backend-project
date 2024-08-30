import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { userRepository } from '../utils/initializeRepositories';

export async function authMiddleware(req: ExpressRequest, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    req.user = null;

    return next();
  }

  try {
    const token = accessToken.split(' ')?.[1];
    const decodedAccessToken = verify(token, process.env.SECRET_PHRASE_ACCESS_TOKEN) as JwtPayload;
    const id = decodedAccessToken.id as string;
    req.user = await userRepository.findOneBy({ id });
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}
