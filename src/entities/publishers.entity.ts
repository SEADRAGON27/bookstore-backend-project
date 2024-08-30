import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookEntity } from './book.entity';

@Entity({ name: 'publishers' })
export class PublisherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @OneToMany(() => BookEntity, (book) => book.publisher, { onDelete: 'CASCADE' })
  books: BookEntity[];
}
