import { DataSource } from 'typeorm';
import { BookEntity } from '../entities/book.entity';
import { UserEntity } from '../entities/user.entity';
import { RefreshSessionEntity } from '../entities/refreshSession.entity';
import { CommentEntity } from '../entities/comment.entity';
import { PromoCodeEntity } from '../entities/promocode.entity';
import { OrderEntity } from '../entities/order.entity';
import { ResetPasswordEntity } from '../entities/resetPassword.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  schema: process.env.DATABASE_SHEMA,
  entities: [BookEntity, RefreshSessionEntity, UserEntity, CommentEntity, PromoCodeEntity, OrderEntity, ResetPasswordEntity],
  logging: false,
  synchronize: true,
  //migrations: ['src/migrations/**/*{.ts,.js}'],
});
