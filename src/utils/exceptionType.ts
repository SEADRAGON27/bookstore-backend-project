import { CustomError } from './customError';

export function exceptionType(exception) {
  if (exception instanceof CustomError) {
    return false;
  }

  return true;
}
