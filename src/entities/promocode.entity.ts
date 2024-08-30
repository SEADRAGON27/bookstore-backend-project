import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'promo_codes' })
@Index(['code', 'isActive'])
export class PromoCodeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'discount_percent' })
  @Index('discount_percent_index')
  discountPercent: number;

  @Column({ nullable: true })
  @Index('max_discount_index')
  maxDiscount: number;

  @Column({ nullable: true })
  @Index('min_order_amount')
  minOrderAmount: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true, name: 'expiration_date' })
  expirationDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index('created_at_promo_code_index')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.promoCodes, { onDelete: 'CASCADE' })
  user: UserEntity;
}
