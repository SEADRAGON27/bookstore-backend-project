import { BookEntity } from '../entities/book.entity';

export interface BookResponse {
  books: FavoritedBook[];
  nextCursor: number;
}

export interface FavoritedBook {
  book: BookEntity;
  favorited: boolean;
}

export interface BookResponseMainPage {
  newBooks: FavoritedBook[];

  salesBooks: FavoritedBook[];

  bestsellerBooks: FavoritedBook[];
}
