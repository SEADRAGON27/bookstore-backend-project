import { ErrorRequestHandler, Request, Response } from 'express';
import { CustomError } from '../interfaces/error.interface';

export const errorHandler: ErrorRequestHandler = (error: CustomError, req: Request, res: Response) => {
  const statusCode = error.status || 500;

  res.status(statusCode).json({ error: error.message || 'Internal server error' });
};
