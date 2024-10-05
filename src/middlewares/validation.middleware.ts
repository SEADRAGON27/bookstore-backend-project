import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';

export function validation<T extends object>(type: new () => T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(type, req.body);
    validate(dtoObject).then((errors) => {
      if (errors.length > 0) {
        const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();

        return res.status(400).json({ errors: errorMessages });
      } else {
        req.body = dtoObject;
        next();
      }
    });
  };
}
