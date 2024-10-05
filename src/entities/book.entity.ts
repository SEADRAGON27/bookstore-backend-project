import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, ManyToOne, UpdateDateColumn, OneToMany, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { LanguageEntity } from './language.entity';
import { CategoryEntity } from './category.entity';
import { AuthorEntity } from './author.entity';
import { PublisherEntity } from './publishers.entity';
import { GenreEntity } from './genre.entity';

@Entity({ name: 'books' })
export class BookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  title: string;

  @Column({ name: 'pages_quantity' })
  pagesQuantity: number;

  @Column()
  summary: string;

  @Column({ type: 'decimal', precision: 7, scale: 2, name: 'original_price' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0, name: 'discounted_price' })
  discountedPrice: number;

  @Column({ name: 'cover_image_link' })
  coverImageLink: string;

  @ManyToOne(() => LanguageEntity, (language) => language.books)
  @Index('language_id_index')
  @JoinColumn({ name: 'language_id' })
  language: LanguageEntity;

  @Column()
  isbn: string;

  @ManyToOne(() => CategoryEntity, (category) => category.books)
  @Index('category_id_index')
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column({ name: 'publication_year' })
  publicationYear: number;

  @ManyToOne(() => PublisherEntity, (publisher) => publisher.books)
  @Index('publisher_id_index')
  @JoinColumn({ name: 'publisher_id' })
  publisher: PublisherEntity;

  @ManyToMany(() => AuthorEntity, (author) => author.books)
  @JoinTable({
    name: 'author_books',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'author_id',
      referencedColumnName: 'id',
    },
  })
  authors: AuthorEntity[];

  @Column({ default: 0, name: 'sales_count' })
  @Index('sales_index')
  salesCount: number;

  @Column({ name: 'avaliable_books' })
  availableBooks: number;

  @Column({ default: 0, name: 'favorites_count' })
  favoritesCount: number;

  @ManyToOne(() => GenreEntity, (genre) => genre.books)
  @Index('genre_id_index')
  @JoinColumn({ name: 'genre_id' })
  genre: GenreEntity;

  @CreateDateColumn({ name: 'created_at' })
  @Index('created_at_book_index')
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updateAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.books, { nullable: true, onDelete: 'CASCADE' })
  user?: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.book, { onDelete: 'CASCADE' })
  comments?: CommentEntity[];
}
