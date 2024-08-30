import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';
import { BookEntity } from '../entities/book.entity';
import { UserEntity } from '../entities/user.entity';
import { mockClient } from 'aws-sdk-client-mock';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { LanguageEntity } from '../entities/language.entity';
import { GenreEntity } from '../entities/genre.entity';
import { PublisherEntity } from '../entities/publishers.entity';
import { AuthorEntity } from '../entities/author.entity';
import { CategoryEntity } from '../entities/category.entity';

export const mockRedis = {
  setex: jest.fn(),
  flushall: jest.fn(),
};

export const s3Mock = mockClient(S3Client);

export const mockQueryBuilder = {
  innerJoinAndSelect: jest.fn().mockReturnThis(),
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
const language = new LanguageEntity();
const genre = new GenreEntity();
const publisher = new PublisherEntity();
const author = new AuthorEntity();
const category = new CategoryEntity();

export const books = [
  {
    id: '1',
    title: 'example-1',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    language: language,
    isbn: ' 2-266-11156-6',
    category: category,
    publicationYear: 1990,
    publisher: publisher,
    authors: [author],
    salesCount: 56,
    availableBooks: 10,
    favoritesCount: 0,
    genre: genre,
    createdAt: new Date(),
    updateAt: new Date(),
    user: user,
    //comments: comments,
  },
  {
    id: '2',
    title: 'example-2',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    language: language,
    isbn: ' 2-266-11156-6',
    category: category,
    publicationYear: 1999,
    publisher: publisher,
    authors: [author],
    salesCount: 0,
    availableBooks: 10,
    favoritesCount: 0,
    genre: genre,
    createdAt: new Date(),
    updateAt: new Date(),
    //user: user,
    //comments: comments,
  },
];

export const booksWithOnlyAuthor = [
  {
    id: '1',
    title: 'example-1',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    isbn: ' 2-266-11156-6',
    publicationYear: 1990,
    authors: [author],
    salesCount: 56,
    availableBooks: 10,
    favoritesCount: 0,
    createdAt: new Date(),
    updateAt: new Date(),
    user: user,
  },
  {
    id: '2',
    title: 'example-2',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    isbn: ' 2-266-11156-6',
    publicationYear: 1999,
    authors: [author],
    salesCount: 0,
    availableBooks: 10,
    favoritesCount: 0,
    createdAt: new Date(),
    updateAt: new Date(),
    user: user,
  },
];

export const booksWithOnlyCategory = [
  {
    id: '1',
    title: 'example-1',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    isbn: ' 2-266-11156-6',
    publicationYear: 1990,
    category: category,
    salesCount: 56,
    availableBooks: 10,
    favoritesCount: 0,
    createdAt: new Date(),
    updateAt: new Date(),
    user: user,
  },
  {
    id: '2',
    title: 'example-2',
    pagesQuantity: 1,
    summary: 'summery',
    originalPrice: 156,
    discountedPrice: 0,
    coverImageLink: 'link',
    isbn: ' 2-266-11156-6',
    category: category,
    salesCount: 0,
    availableBooks: 10,
    favoritesCount: 0,
    createdAt: new Date(),
    updateAt: new Date(),
    user: user,
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
const booksCopy = structuredClone(booksWithOnlyAuthor);
booksCopy[0].favoritesCount = 1;

export const book3 = booksCopy[0];

export const bookAttributes = {
  language: 'Ukrainian',
  category: 'Fiction',
  genre: 'Fantasy',
  authors: 'Maus Pol',
  publisher: 'MGT',
};

export const exampleBookOnlyAuthor = {
  id: '',
  title: 'example-book-title',
  pagesQuantity: 350,
  summary: 'This is an example summary of the book.',
  coverImageLink: 'link',
  originalPrice: 29.99,
  discountedPrice: 19.99,
  isbn: '978-3-16-148410-0',
  publicationYear: 2023,
  salesCount: 0,
  availableBooks: 100,
  favoritesCount: 0,
  createdAt: new Date(),
  updateAt: new Date(),
  authors: [{ id: 1, fullName: bookAttributes.authors }],
};

export const booksOnTheMainPage = {
  newBooks: [{ book: exampleBookOnlyAuthor, favorited: false }],
  salesBooks: [{ book: exampleBookOnlyAuthor, favorited: false }],
  bestsellerBooks: [{ book: exampleBookOnlyAuthor, favorited: false }],
};

export const exampleBook = {
  title: 'example-book-title',
  pagesQuantity: 350,
  summary: 'This is an example summary of the book.',
  coverImageLink: 'link',
  originalPrice: 29.99,
  discountedPrice: 19.99,
  language: { id: 1, name: bookAttributes.language },
  isbn: '978-3-16-148410-0',
  category: { id: 1, name: bookAttributes.language },
  publicationYear: 2023,
  publisher: { id: 1, name: bookAttributes.publisher },
  authors: [{ id: 1, fullName: bookAttributes.authors }],
  availableBooks: 100,
  genre: { id: 1, name: bookAttributes.genre },
  user: {},
};

export const booksLength31a = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(exampleBook);
  newBook.title = `example-book-title-${index + 1}`;

  return newBook;
});

export const book1 = booksWithOnlyAuthor[0];
export const book2 = booksWithOnlyAuthor[1];

const book4 = booksWithOnlyCategory[0];
const book5 = booksWithOnlyCategory[1];

const book7 = books[0];
const book8 = books[1];

const booksCopy2 = structuredClone(booksWithOnlyCategory);
booksCopy[0].favoritesCount = 1;

export const book6 = booksCopy2[0];

const booksCopy3 = structuredClone(books);
booksCopy[0].favoritesCount = 1;

export const book9 = booksCopy3[0];

export const expectedDataWithoutUserAuthor = [
  { book: book1, favorited: false },
  { book: book2, favorited: false },
];

export const expectedDataWithUserAuthor = [
  { book: book1, favorited: false },
  { book: book3, favorited: true },
];

export const expectedDataWithoutUserCategory = [
  { book: book4, favorited: false },
  { book: book5, favorited: false },
];

export const expectedDataWithUserCategory = [
  { book: book4, favorited: false },
  { book: book6, favorited: true },
];

export const expectedDataWithoutUser = [
  { book: book7, favorited: false },
  { book: book8, favorited: false },
];

export const expectedDataWithUser = [
  { book: book7, favorited: false },
  { book: book9, favorited: true },
];

export const currentUser = {
  favoriteBooks: [{ id: '2' }],
};

export const booksLength31 = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(book6);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = String(index + 1);

  return newBook;
});

export const bookResponceWithCursor = {
  books: booksLength31,
  nextCursor: null,
};

export const booksLength29 = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(book6);
  newBook.title = `example-book-title ${index + 1}`;
  newBook.id = String(index + 1);

  return newBook;
});

export const booksLength31WithFavorited = Array.from({ length: 31 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithUserCategory[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = String(index + 1);

  return newBook;
});

export const booksLength29WithFavorited = Array.from({ length: 29 }, (_, index) => {
  const newBook = structuredClone(expectedDataWithUserCategory[1]);
  newBook.book.title = `example-book-title ${index + 1}`;
  newBook.book.id = String(index + 1);

  return newBook;
});

export const expactingDataForPointers = [
  { book: book7, favorited: true },
  { book: book8, favorited: false },
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
  email: process.env.TEST_EMAIL_ADMIN,
  password: '1',
  role: 'admin',
};

export const createUserTest = {
  username: 'Slava',
  email: process.env.TEST_EMAIL,
  password: '2',
  role: 'user',
};
