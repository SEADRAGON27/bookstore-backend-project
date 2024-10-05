import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

export class WinstonLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const esTransportOpts = {
      level: 'info',
      clientOpts: { node: process.env.ELASTICSEARCH_HOST },
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new ElasticsearchTransport(esTransportOpts),
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}

export const winstonLoggerService = new WinstonLoggerService();
