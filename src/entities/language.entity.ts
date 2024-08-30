import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BookEntity } from './book.entity';

@Entity({ name: 'languages' })
export class LanguageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @OneToMany(() => BookEntity, (book) => book.language, { onDelete: 'CASCADE' })
  books: BookEntity[];
}
