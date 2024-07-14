import path from 'path';
import { pino } from 'pino';

const filePath = path.join(__dirname, 'app.log');

export const logger = pino({
  transport: {
    targets: [
      {
        level: 'info',
        target: 'pino/file',
        options: { destination: filePath },
      },
    ],
  },
});
