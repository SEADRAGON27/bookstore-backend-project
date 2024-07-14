import { BeforeInsert, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { hash } from 'bcrypt';
import { RefreshSessionEntity } from './refreshSession.entity';
import { CommentEntity } from './comment.entity';
import { BookEntity } from './book.entity';
import { ResetPasswordEntity } from './resetPassword.entity';
import { OrderEntity } from './order.entity';
import { PromoCodeEntity } from './promocode.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ nullable: true })
  google_id: string;

  @Column({ default: false })
  is_confirmed: boolean;

  @Column({ nullable: true, unique: true })
  confirmation_token: string | null;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  @OneToMany(() => RefreshSessionEntity, (refreshSession) => refreshSession.user)
  refresh_session: RefreshSessionEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @ManyToMany(() => CommentEntity)
  @JoinTable()
  favorite_comments: CommentEntity[];

  @ManyToMany(() => BookEntity)
  @JoinTable()
  favorite_books: BookEntity[];

  @OneToMany(() => BookEntity, (book) => book.user)
  books: BookEntity[];

  @OneToMany(() => ResetPasswordEntity, (token) => token.user)
  resetPasswordTokens: ResetPasswordEntity[];

  @OneToMany(() => OrderEntity, (orders) => orders.user)
  orders: OrderEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @OneToMany(() => PromoCodeEntity, (promocode) => promocode.user)
  promoCodes: PromoCodeEntity[];
}
