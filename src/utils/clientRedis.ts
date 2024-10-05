import 'dotenv/config';
import { Redis } from 'ioredis';

export const clientRedis = new Redis({
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
});
