import { instanceToPlain } from 'class-transformer';
import { CustomError } from '../utils/customError';
import { winstonLoggerService } from '../logs/logger';

export function Log(logOptions: Record<string, boolean>) {
  return function (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const req = args[0];
      const res = args[1];
      const next = args[2];

      const logData = [];

      for (const [key, shouldLog] of Object.entries(logOptions)) {
        if (shouldLog) {
          const data = instanceToPlain(req[key]);
          logData.push(data);
        }
      }

      try {
        const result = await originalMethod.apply(this, args);

        winstonLoggerService.log(`Response Status: ${res.statusCode} for ${req.method} ${req.originalUrl} with data: ${JSON.stringify(logData, null, 2)}`);

        return result;
      } catch (error) {
        if (!(error instanceof CustomError)) {
          winstonLoggerService.error(`Error in request to ${req.method} ${req.originalUrl}: ${error.message} with data: ${JSON.stringify(logData, null, 2)}`);
        }

        next(error);
      }
    };

    return descriptor;
  };
}
