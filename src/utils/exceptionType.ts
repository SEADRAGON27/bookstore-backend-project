import { CustomError } from '../interfaces/customError';

export function exceptionType(exception) {
  if (exception instanceof CustomError) {
    return false;
  }

  return true;
}
