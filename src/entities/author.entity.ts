import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookEntity } from './book.entity';

@Entity({ name: 'authors' })
export class AuthorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100, name: 'full_name' })
  fullName: string;

  @ManyToMany(() => BookEntity, (book) => book.authors, { onDelete: 'CASCADE' })
  books: BookEntity[];
}
