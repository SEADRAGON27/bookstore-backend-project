import 'dotenv/config';
import { Redis } from 'ioredis';

export const clientRedis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});
