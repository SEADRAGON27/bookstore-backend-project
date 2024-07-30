import { S3Client } from '@aws-sdk/client-s3';
import { BookEntity } from '../entities/book.entity';
import { UserEntity } from '../entities/user.entity';
import { mockClient } from 'aws-sdk-client-mock';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { BookResponseMainPage } from '../interfaces/bookResponce.interface';

export const mockRedis = {
  setex: jest.fn(),
  flushall: jest.fn(),
};

export const s3Mock = mockClient(S3Client);

export const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
};

export const mockBookRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

export const mockUserRepository = {
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

export const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

export const mockBookRepositoryClass = jest.fn(() => ({
  find: mockBookRepository.find,
  findOne: mockBookRepository.findOne,
  findOneBy: mockBookRepository.findOneBy,
  save: mockBookRepository.save,
  delete: mockBookRepository.delete,
  createQueryBuilder: mockBookRepository.createQueryBuilder,
}));

export const mockUserRepositoryClass = jest.fn(() => ({
  findOneBy: mockUserRepository.findOneBy,
  findOne: mockUserRepository.findOne,
  save: mockUserRepository.save,
}));

export const mockRedisClass = jest.fn(() => ({
  setex: mockRedis.setex,
  flushall: mockRedis.flushall,
}));

export const mockLoggerClass = {
  info: mockLogger.info,
  error: mockLogger.error,
};

export const redis = new mockRedisClass() as unknown as Redis;

export const mockLoggerInstance = mockLoggerClass;

export const userRepository = new mockUserRepositoryClass() as unknown as Repository<UserEntity>;

export const bookRepository = new mockBookRepositoryClass() as unknown as Repository<BookEntity>;

const user = new UserEntity();

export const books = [
  {
    id: 1,
    title: 'example-1',
    pages_quantity: 1,
    summary: 'summery',
    original_price: 156,
    discounted_price: 0,
    cover_image_link: 'link',
    language: 'franch',
    isbn: ' 2-266-11156-6',
    category: 'fiction',
    publication_year: 1990,
    publisher: 'the Sun',
    author: 'John',
    sales_count: 56,
    available_books: 10,
    favorites_count: 0,
    genre: 'fantasy',
    created_at: new Date(),
    update_at: new Date(),
    user: user,
    //comments: comments,
  },
  {
    id: 2,
    title: 'example-2',
    pages_quantity: 1,
    summary: 'summery',
    original_price: 156,
    discounted_price: 0,
    cover_image_link: 'link',
    language: 'franch',
    isbn: ' 2-266-11156-6',
    category: 'fiction',
    publication_year: 1999,
    publisher: 'the Sun',
    author: 'John',
    sales_count: 0,
    available_books: 10,
    favorites_count: 0,
    genre: 'fantasy',
    created_at: new Date(),
    update_at: new Date(),
    //user: user,
    //comments: comments,
  },
];

export const booksOnTheMainPage: BookResponseMainPage = {
  newBooks: [
    { book: books[0], favorited: false },
    { book: books[1], favorited: false },
  ],
  salesBooks: [],
  bestsellerBooks: [
    { book: books[0], favorited: false },
    { book: books[1], favorited: false },
  ],
};

export const cacheRedisBookCategory = [
  {
    book: books[0],
    favorited: false,
  },
];

export const booksResponse = {
  books: [
    {
      book: books[0],
      favorited: false,
    },
  ],
  nextCursor: null,
};
const booksCopy = structuredClone(books);
booksCopy[0].favorites_count = 1;

export const book3: BookEntity = booksCopy[0];

export const exampleBook = {
  title: 'example-book-title',
  pages_quantity: 350,
  summary: 'This is an example summary of the book.',
  cover_image_link: 'link',
  original_price: 29.99,
  discounted_price: 19.99,
  language: 'English',
  isbn: '978-3-16-148410-0',
  category: 'fiction',
  publication_year: 2023,
  publisher: 'Example Publisher',
  author: 'John Doe',
  available_books: 100,
  genre: 'Thriller',
};

export const booksLength31a = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(exampleBook);
  newBook.title = `example-book-title-${index + 1}`;

  return newBook;
});

export const booksLength31 = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(book3);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = index + 1;

  return newBook;
});

export const bookResponceWithCursor = {
  books: booksLength31,
  nextCursor: null,
};
export const book1 = books[0];
export const book2 = books[1];

export const expectedDataWithoutUser = [
  { book: book1, favorited: false },
  { book: book2, favorited: false },
];

export const expectedDataWithUser = [
  { book: book1, favorited: false },
  { book: book3, favorited: true },
];

export const currentUser = {
  favorite_books: [{ id: 2 }],
};

export const booksLength29 = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(book3);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = index + 1;

  return newBook;
});

export const booksLength31WithFavorited = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithUser[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = index + 1;

  return newBook;
});

export const booksLength29WithFavorited = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithUser[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = index + 1;

  return newBook;
});

export const booksLength31UserIsUnfound = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(book2);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = index + 1;

  return newBook;
});

export const booksLength29UserIsUnfound = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(book2);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = index + 1;

  return newBook;
});

export const booksLength31WithFavoritedUserIsUnfound = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithoutUser[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = index + 1;

  return newBook;
});

export const booksLength29WithFavoritedUserIsUnfound = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithoutUser[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = index + 1;

  return newBook;
});

export const expactingDataForPointers = [
  { book: book1, favorited: true },
  { book: book2, favorited: false },
];

export const query = {
  genre: 'fantasy',
  price: '50-178',
  publisher: 'the Sun',
  publication_year: '1990-2024',
  sales_count: '0',
  discounted_price: '10',
  language: 'french',
  new: true,
  cursor: '1',
};
export const BooksOnTheMainPageEmptyArray = { newBooks: [], salesBooks: [], bestsellerBooks: [] };

export const createUserAdminTest = {
  username: 'Nikita',
  email: 'nik@gmail.com',
  password: '1',
  role: 'admin',
};

export const createUserTest = {
  username: 'Slava',
  email: 'slv@gmail.com',
  password: '2',
  role: 'user',
};
