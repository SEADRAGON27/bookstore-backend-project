import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BookEntity } from './book.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  user_name: string;

  @Column()
  last_name: string;

  @Column()
  phone_number: string;

  @Column()
  email: string;

  @Column()
  @Index()
  city: string;

  @Column()
  payment_method: string;

  @Column()
  delivery_method: string;

  @Column()
  @Index()
  branch_address: string;

  @Column({ nullable: true })
  promo_code: string;

  @Column()
  total_sum: number;

  @Column()
  quantity_of_books: number;

  @ManyToMany(() => BookEntity)
  @JoinTable()
  ordered_books: BookEntity[];

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, unique: true })
  confirmation_token: string | null;

  @ManyToOne(() => UserEntity, (user) => user.orders, { nullable: true })
  user: UserEntity;
}
