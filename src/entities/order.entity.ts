import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  name: string;

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
  amount: number;

  @Column()
  delivery_method: string;

  @Column()
  @Index()
  branch_address: string;

  @Column({ nullable: true })
  promo_code: string;

  @Column()
  total_amount: number;

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
