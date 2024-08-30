import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { BookEntity } from './book.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column()
  email: string;

  @Column()
  @Index('city_index')
  city: string;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ name: 'delivery_method' })
  deliveryMethod: string;

  @Column({ name: 'branch_address' })
  @Index('branch_address_index')
  branchAddress: string;

  @Column({ nullable: true, name: 'promo_code' })
  promoCode: string;

  @Column({ name: 'total_sum' })
  totalSum: number;

  @Column({ name: 'quantity_of_books' })
  quantityOfBooks: number;

  @ManyToMany(() => BookEntity)
  @JoinTable({
    name: 'order_books',
    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
  })
  orderedBooks: BookEntity[];

  @CreateDateColumn({ name: 'created_at' })
  @Index('created_at_order_index')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, unique: true })
  confirmationToken: string | null;

  @ManyToOne(() => UserEntity, (user) => user.orders, { nullable: true, onDelete: 'CASCADE' })
  user: UserEntity;
}
