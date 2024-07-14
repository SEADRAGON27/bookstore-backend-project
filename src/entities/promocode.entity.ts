import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'promo_codes' })
@Index(['code', 'is_active'])
export class PromoCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  @Index()
  discount_percent: number;

  @Column({ nullable: true })
  @Index()
  max_discount: number;

  @Column({ nullable: true })
  @Index()
  min_order_amount: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ nullable: true })
  expiration_date: Date;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.promoCodes, { onDelete: 'CASCADE' })
  user: UserEntity;
}
