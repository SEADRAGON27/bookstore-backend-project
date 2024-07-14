import { BookEntity } from '../entities/book.entity';

export interface BookResponse {
  books: BookEntity[];
  nextCursor?: number;
  favorited?: boolean;
}
