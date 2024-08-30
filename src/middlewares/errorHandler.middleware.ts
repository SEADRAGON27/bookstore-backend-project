/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { CustomError } from '../interfaces/error.interface';

export const errorHandler: ErrorRequestHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.status || 500;
  res.status(statusCode).json({ message: error.message || 'Internal server error' });
};
