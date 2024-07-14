import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, ManyToOne, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';

@Entity({ name: 'books' })
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  title: string;

  @Column()
  pages_quantity: number;

  @Column()
  summary: string;

  @Column({ type: 'double precision' })
  original_price: number;

  @Column({ type: 'double precision' })
  discounted_price: number;

  @Column()
  cover_image_link: string;

  @Column()
  @Index()
  language: string;

  @Column()
  isbn: string;

  @Column()
  @Index('caterory_index')
  category: string;

  @Column()
  publication_year: number;

  @Column()
  publisher: string;

  @Column()
  @Index()
  author: string;

  @Column()
  @Index('sales_index')
  sales_count: number;

  @Column()
  available_books: number;

  @Column({ default: 0 })
  favorites_count: number;

  @Column()
  @Index('genre_index')
  genre: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @UpdateDateColumn()
  update_at: Date;

  @ManyToOne(() => UserEntity, (user) => user.books, { nullable: true })
  user: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.book)
  comments: CommentEntity[];
}
