import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { RefreshSessionEntity } from './refreshSession.entity';
import { CommentEntity } from './comment.entity';
import { BookEntity } from './book.entity';
import { ResetPasswordEntity } from './resetPassword.entity';
import { OrderEntity } from './order.entity';
import { PromoCodeEntity } from './promoCode.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ default: false, name: 'is_confirmed' })
  isConfirmed: boolean;

  @Column({ nullable: true, unique: true, name: 'confirmation_token' })
  confirmationToken: string | null;

  @OneToMany(() => RefreshSessionEntity, (refreshSession) => refreshSession.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'refresh_session' })
  refreshSession: RefreshSessionEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user, { onDelete: 'CASCADE' })
  comments: CommentEntity[];

  @ManyToMany(() => CommentEntity)
  @JoinTable({
    name: 'favorited_comments',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'comment_id',
      referencedColumnName: 'id',
    },
  })
  favoriteComments: CommentEntity[];

  @ManyToMany(() => BookEntity)
  @JoinTable({
    name: 'favorited_books',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
  })
  favoriteBooks: BookEntity[];

  @OneToMany(() => BookEntity, (book) => book.user)
  books: BookEntity[];

  @OneToMany(() => ResetPasswordEntity, (token) => token.user)
  resetPasswordTokens: ResetPasswordEntity[];

  @OneToMany(() => OrderEntity, (orders) => orders.user)
  orders: OrderEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateAt: Date;

  @OneToMany(() => PromoCodeEntity, (promocode) => promocode.user)
  promoCodes: PromoCodeEntity[];
}
