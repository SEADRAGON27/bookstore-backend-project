import { dataSource } from '../configs/orm.config';
import { BookEntity } from '../entities/book.entity';
import { CommentEntity } from '../entities/comment.entity';
import { OrderEntity } from '../entities/order.entity';
import { PromoCodeEntity } from '../entities/promocode.entity';
import { RefreshSessionEntity } from '../entities/refreshSession.entity';
import { ResetPasswordEntity } from '../entities/resetPassword.entity';
import { UserEntity } from '../entities/user.entity';

export const bookRepository = dataSource.getRepository(BookEntity);
export const userRepository = dataSource.getRepository(UserEntity);
export const commentRepository = dataSource.getRepository(CommentEntity);
export const orderRepository = dataSource.getRepository(OrderEntity);
export const promoCodeRepository = dataSource.getRepository(PromoCodeEntity);
export const refreshSessionRepository = dataSource.getRepository(RefreshSessionEntity);
export const resetPasswordRepository = dataSource.getRepository(ResetPasswordEntity);
