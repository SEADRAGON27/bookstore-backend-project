/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'dotenv/config';
import { FindOperator, In, MoreThan, SelectQueryBuilder } from 'typeorm';
import { BookEntity } from '../../entities/book.entity';
import { UserEntity } from '../../entities/user.entity';
import { BookService } from '../../services/book.service';
import { bookRepository, books, booksLength29, booksLength29WithFavorited, booksLength31, booksLength31WithFavorited,
  booksWithOnlyAuthor,
  currentUser, expactingDataForPointers, expectedDataWithoutUser, expectedDataWithoutUserCategory, expectedDataWithUser, expectedDataWithUserAuthor, expectedDataWithUserCategory, mockBookRepository, mockQueryBuilder, mockRedis,
  mockUserRepository, query, redis, s3Mock, userRepository } from '../utils';
import QueryString from 'qs';
import { BookDto } from '../../dto/book.dto';
import { CustomError } from '../../interfaces/customError';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { GenreEntity } from '../../entities/genre.entity';
import { FavoritedBook } from '../../interfaces/bookResponce.interface';

describe('BookService', () => {
  let bookService: BookService;
  beforeEach(() => {
    bookService = new BookService(redis, bookRepository, userRepository);
    s3Mock.reset();
    jest.clearAllMocks();
  });

  describe('getBooksOnTheMainPage', () => {
    const originalUrl = '/books/';

    it('should return books for the main page when user is authenticated', async () => {
      const userId = '1';
      booksWithOnlyAuthor[1].favoritesCount = 1;
      mockBookRepository.find.mockResolvedValue(booksWithOnlyAuthor);
      let booksWithFavorited;

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockImplementation(async (_userId, books) => {
        const favoriteIds = currentUser.favoriteBooks.map((favorite) => favorite.id);

        booksWithFavorited = booksWithOnlyAuthor.map((book) => {
          const favorited = favoriteIds.includes(book.id);

          return { book, favorited };
        });

        return booksWithFavorited;
      });

      const result = await bookService.getBooksOnTheMainPage(userId, originalUrl);

      const expectDataMainPage = {
        newBooks: booksWithFavorited,
        salesBooks: booksWithFavorited,
        bestsellerBooks: booksWithFavorited,
      };
      expect(result).toEqual(expectDataMainPage);

      expect(bookRepository.find).toHaveBeenCalledTimes(3);
      expect(bookService.getPointersLikedBooksByUser).toHaveBeenCalledTimes(3);
    });

    it('should return books for the main page when user is not authenticated', async () => {
      const userId = null;

      mockBookRepository.find.mockResolvedValue(booksWithOnlyAuthor);
      let booksWithFavorited;
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockImplementation(async (_userId, books) => {
        booksWithFavorited = booksWithOnlyAuthor.map((book) => {
          const favorited = false;

          return { book, favorited };
        });

        return booksWithFavorited;
      });

      const result = await bookService.getBooksOnTheMainPage(userId, originalUrl);

      const expectDataMainPage = {
        newBooks: booksWithFavorited,
        salesBooks: booksWithFavorited,
        bestsellerBooks: booksWithFavorited,
      };

      expect(result).toEqual(expectDataMainPage);

      expect(bookRepository.find).toHaveBeenCalledTimes(3);
      expect(bookService.getPointersLikedBooksByUser).toHaveBeenCalledTimes(3);
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(expectDataMainPage));
    });

    it("should return empty array , when bookstore hasn't books", async () => {
      const userId = null;

      mockBookRepository.find.mockResolvedValue([]);

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue([]);

      const result = await bookService.getBooksOnTheMainPage(userId, originalUrl);

      const expectedDataMainPage = {
        newBooks: [],
        salesBooks: [],
        bestsellerBooks: [],
      };

      expect(result).toEqual(expectedDataMainPage);

      expect(bookRepository.find).toHaveBeenCalledTimes(3);
      expect(bookService.getPointersLikedBooksByUser).toHaveBeenCalledTimes(3);
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(expectedDataMainPage));
    });
  });

  describe('getBooksByCategory', () => {
    const category = 'fiction';
    const originalUrl = '/books/fiction?genre=fantasy';
    const query = { genre: 'fantasy' };

    it('should return books for a given category, when user is authenticated', async () => {
      const userId = '1';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, queryBuilder, _query) => {
        jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockImplementation(async (_userId, booksWithOnlyCategory) => {
          const favoriteIds = currentUser.favoriteBooks.map((favorite) => favorite.id);
          const booksWithFavorited = booksWithOnlyCategory.map((book) => {
            const favorited = favoriteIds.includes(book.id);

            return { book, favorited };
          });

          return booksWithFavorited ;
        });

        await mockRedis.setex(originalUrl, 3600000, JSON.stringify(expectedDataWithUserCategory));

        return {
          books: expectedDataWithUserCategory as unknown as FavoritedBook[],
          nextCursor: null,
        };
      });

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(expectedDataWithUserCategory as unknown as FavoritedBook[]);

      const result = await bookService.getBooksByCategory(userId, category, originalUrl, query);

      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.category', 'category');
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, mockQueryBuilder as unknown as SelectQueryBuilder<BookEntity>, query);
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(expectedDataWithUserCategory));
      expect(result).toEqual({ books: expectedDataWithUserCategory, nextCursor: null });
    });

    it('should return books for a given category, when user is not authenticated', async () => {
      const userId = null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, _queryBuilder, _query) => {
        await mockRedis.setex(originalUrl, 3600000, JSON.stringify(expectedDataWithoutUserCategory));

        return {
          books: expectedDataWithoutUserCategory as unknown as FavoritedBook[],
          nextCursor: null,
        };
      });
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(expectedDataWithoutUserCategory as unknown as FavoritedBook[]);

      const result = await bookService.getBooksByCategory(userId, category, originalUrl, query);

      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.category', 'category');
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, expect.any(Object), query);
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(expectedDataWithoutUserCategory));
      expect(result).toEqual({ books: expectedDataWithoutUserCategory, nextCursor: null });
    });

    it("should return empty array for a given category, when bookstore hasn't books", async () => {
      const userId = null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, _queryBuilder, _query) => {
        return {
          books: [],
          nextCursor: null,
        };
      });
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue([]);

      const result = await bookService.getBooksByCategory(userId, category, originalUrl, query);

      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.category', 'category');
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, expect.any(Object), query);
      expect(result).toEqual({ books: [], nextCursor: null });
    });

    it('should return books with nextCursor if there are more than pageSize books', async () => {
      const userId = '1';

      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, _queryBuilder, _query) => {
        mockQueryBuilder.getMany.mockResolvedValue(booksLength31);
        await mockRedis.setex(originalUrl, 3600000, JSON.stringify(booksLength31WithFavorited.slice(0, 30)));

        return {
          books: booksLength31WithFavorited.slice(0, 30) as unknown as FavoritedBook[],
          nextCursor: '30',
        };
      });
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(booksLength31WithFavorited as unknown as FavoritedBook[]);

      const result = await bookService.getBooksByCategory(userId, category, originalUrl, query);

      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.category', 'category');
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(booksLength31WithFavorited.slice(0, 30)));
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, expect.any(Object), query);
      expect(result).toEqual({ books: booksLength31WithFavorited.slice(0, 30), nextCursor: '30' });
    });

    it('should return books with nextCursor if there are less than pageSize books', async () => {
      const userId = '1';

      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, _queryBuilder, _query) => {
        mockQueryBuilder.getMany.mockResolvedValue(booksLength29);
        await mockRedis.setex(originalUrl, 3600000, JSON.stringify(booksLength29WithFavorited));

        return {
          books: booksLength29WithFavorited as unknown as FavoritedBook[],
          nextCursor: null,
        };
      });
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(booksLength29WithFavorited as unknown as FavoritedBook[]);

      const result = await bookService.getBooksByCategory(userId, category, originalUrl, query);

      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.category', 'category');
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(booksLength29WithFavorited));
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, expect.any(Object), query);
      expect(result).toEqual({ books: booksLength29WithFavorited, nextCursor: null });
    });
  });

  describe('searchBook', () => {
    const originalUrl = '/books/search?param=war-and-peaced&language=french';
    const query = { text: 'war-and-peaced', language: 'french' };

    it('should return book according to the specified parameters user is authenticated', async () => {
      const userId = '1';

      jest.spyOn(bookService, 'queryBuilder').mockImplementation(async (_userId, originalUrl, _queryBuilder, _query) => {
        await mockRedis.setex(originalUrl, 3600000, JSON.stringify(expectedDataWithUserAuthor));

        return {
          books: expectedDataWithUserAuthor as unknown as FavoritedBook[],
          nextCursor: null,
        };
      });
      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(expectedDataWithUserAuthor as unknown as FavoritedBook[]);

      const result = await bookService.searchBook(userId, originalUrl, query);
      expect(mockBookRepository.createQueryBuilder).toHaveBeenCalledWith('book');
      expect(mockQueryBuilder.innerJoinAndSelect).toHaveBeenCalledWith('book.authors', 'author');
      expect(bookService.queryBuilder).toHaveBeenCalledWith(userId, originalUrl, expect.any(Object), query);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockRedis.setex).toHaveBeenCalledWith(originalUrl, 3600000, JSON.stringify(expectedDataWithUserAuthor));
      expect(result).toEqual({ books: expectedDataWithUserAuthor, nextCursor: null });
    });
  });

  describe('queryBuilder', () => {
    const originalUrl = '/books/fiction?genre=fantasy&price=10-50&publisher=Penguin&publication_year=2020-2023&sales_count=100&new=true&discounted_price=true&language=English';

    it('should return books and nextCursor. user is authenticated', async () => {
      const userId = '1';

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValue(expectedDataWithUser as unknown as FavoritedBook[]);

      const result = await bookService.queryBuilder(userId, originalUrl, mockQueryBuilder as unknown as SelectQueryBuilder<BookEntity>, query as unknown as QueryString.ParsedQs);

      //expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('genre.name = :genre', { genre: query.genre });
      //expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('book.originalPrice between :from and :to', { from: query.price.split('-')[0], to: query.price.split('-')[1] });
      //expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('publisher.name = :publisher', { publisher: query.publisher });
      //expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('book.id > :cursor', { cursor: query.cursor });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('book.id', 'ASC');
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(31);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();

      expect(result).toEqual({
        books: expectedDataWithUser,
        nextCursor: null,
      });
    });

    it('should return books and nextCursor ,if there are more than pageSize', async () => {
      const userId = '1';

      mockQueryBuilder.getMany.mockResolvedValue(booksLength31);

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValueOnce(booksLength31WithFavorited as unknown as FavoritedBook[]);

      const result = await bookService.queryBuilder(userId, originalUrl, mockQueryBuilder as unknown as SelectQueryBuilder<BookEntity>, query as unknown as QueryString.ParsedQs);

      expect(result).toEqual({
        books: booksLength31WithFavorited.slice(0, 30),
        nextCursor: '30',
      });
    });

    it('should return books and nextCursor ,if there are less than pageSize', async () => {
      const userId = '1';

      mockQueryBuilder.getMany.mockResolvedValue(booksLength29);

      jest.spyOn(bookService, 'getPointersLikedBooksByUser').mockResolvedValueOnce(booksLength29WithFavorited as unknown as FavoritedBook[]);

      const result = await bookService.queryBuilder(userId, originalUrl, mockQueryBuilder as unknown as SelectQueryBuilder<BookEntity>, query as unknown as QueryString.ParsedQs);

      expect(result).toEqual({
        books: booksLength29WithFavorited as unknown as FavoritedBook[],
        nextCursor: null,
      });
    });
  });

  describe('getBook', () => {
    it('should return a book with the specified title', async () => {
      const title = books[0].title;

      mockBookRepository.findOne.mockResolvedValue(books[0]);

      const book = await bookService.getBook(title);

      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { title: title, availableBooks: new FindOperator('moreThan', 0) },
        relations: ['comments', 'comments.parentComment','authors','language','publisher','genre','category'],
      });

      expect(book).toEqual(books[0]);
    });

    it('should return 0, if the book is not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(bookService.getBook('Nonexistent Book')).rejects.toThrowError(new CustomError(404, "Book doesn't exist"));
    });
  });

  describe('addBookToFavorites', () => {
    it('should return books, when user have favorited books', async () => {
      const userId = '1';
      const bookId = books[0].id;
      const user = { id: userId, favoriteBooks: [] };

      mockBookRepository.findOneBy.mockResolvedValue(books[0]);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockBookRepository.save.mockResolvedValue(books[0]);

      const result = await bookService.addBookToFavorites(userId, bookId);

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id: bookId });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });
      expect(user.favoriteBooks).toContain(books[0]);
      expect(books[0].favoritesCount).toBe(1);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(mockBookRepository.save).toHaveBeenCalledWith(books[0]);
      expect(result).toBe(books[0]);
    });

    it('should not add book to user favorites if already favorited', async () => {
      const userId = '1';
      const bookId = '1';
      books[0].favoritesCount = 1;
      const user = { id: userId, favoriteBooks: [books[0]] };

      mockBookRepository.findOneBy.mockResolvedValue(books[0]);
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await bookService.addBookToFavorites(userId, bookId);

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id: bookId });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });
      expect(user.favoriteBooks).toContain(books[0]);
      expect(books[0].favoritesCount).toBe(1);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toBe(books[0]);
    });
  });

  describe('deleteBookToFavorites', () => {
    it('should remove book from user favorites if already favorited', async () => {
      const userId = '1';
      const bookId = '1';
      books[0].favoritesCount = 1;

      const user = { id: userId, favoriteBooks: [books[0]] };

      mockBookRepository.findOneBy.mockResolvedValue(books[0]);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      mockBookRepository.save.mockResolvedValue(books[0]);

      const result = await bookService.deleteBookFromFavorites(userId, bookId);

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id: bookId });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });
      expect(user.favoriteBooks).not.toContain(books[0]);
      expect(books[0].favoritesCount).toBe(0);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(mockBookRepository.save).toHaveBeenCalledWith(books[0]);
      expect(result).toBe(books[0]);
    });

    it('should not remove book from user favorites if not favorited', async () => {
      const userId = '1';
      const id = '1';

      const user = { id: userId, favoriteBooks: [] };

      mockBookRepository.findOneBy.mockResolvedValue(books[0]);
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await bookService.deleteBookFromFavorites(userId, id);

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });
      expect(user.favoriteBooks).not.toContain(books[0]);
      expect(books[0].favoritesCount).toBe(0);
      expect(mockBookRepository.save).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result).toBe(books[0]);
    });
  });

  describe('createBook', () => {
    it('should create and save the book', async () => {
      const userId = '1';
      const createBookDto: BookDto = books[0];
      const user = '1';
      const savedBook = { id: '1', ...createBookDto, user };

      mockBookRepository.findOneBy.mockResolvedValue(null);
      mockBookRepository.save.mockResolvedValue(savedBook);

      const result = await bookService.createBook(userId, createBookDto);

      expect(bookRepository.findOneBy).toHaveBeenCalledWith({ title: createBookDto.title });
      expect(bookRepository.save).toHaveBeenCalledWith(expect.objectContaining({ ...createBookDto, user }));
      expect(result).toEqual(savedBook);
    });
  });

  describe('updateBook', () => {
    it('should update and save the book', async () => {
      const userId = '2';
      const bookId = books[0].id;
      const updateBook = structuredClone(books[0]);
      updateBook.genre = { id: 1, name: 'history' } as GenreEntity;
      updateBook.user.id = '2' ;

      const updateBookDTO = {
       ...updateBook,
      } as BookEntity;

      books[0].user.id = '1' ;
      const existingBook = {
        
        ...books[0],
      } as BookEntity;

      mockBookRepository.findOne.mockResolvedValue(existingBook);
      mockBookRepository.save.mockResolvedValue(updateBookDTO);

      const result = await bookService.updateBook(userId, bookId, updateBookDTO);

      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['user'],
      });

      expect(existingBook.user.id).toBe(userId);
      expect(existingBook.genre).toBe(updateBookDTO.genre);
      expect(mockBookRepository.save).toHaveBeenCalledWith(existingBook);
      expect(result).toEqual(updateBookDTO);
    });

    it('should throw error,if the book does not exist ', async () => {
      const userId = '1';
      const bookId = books[0].id;
      books[0].genre = { id: 1, name: 'history' } as GenreEntity;
      const updateBookDto: BookDto = books[0];

      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(bookService.updateBook(userId, bookId, updateBookDto)).rejects.toThrow(CustomError);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({ where: { id: bookId }, relations: ['user'] });
    });
  });

  describe('deleteBook', () => {
    it('should delete book', async () => {
      const id = books[0].id;
      const book = { id: id, coverImageLink: 'test-link', user: {} };

      mockBookRepository.findOneBy.mockResolvedValue(book);

      const deleteImageS3Mock = jest.spyOn(bookService, 'deleteImageS3').mockResolvedValue(null);

      await bookService.deleteBook(id);

      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({id});
      expect(mockBookRepository.delete).toHaveBeenCalledWith({id});
      expect(deleteImageS3Mock).toHaveBeenCalledWith(book.coverImageLink);
    });

    it('should throw error,if the book does not exist', async () => {
      const id = books[0].id;

      mockBookRepository.findOneBy.mockResolvedValue(null);

      await expect(bookService.deleteBook(id)).rejects.toThrow(CustomError);
      expect(mockBookRepository.findOneBy).toHaveBeenCalledWith({ id });
    });
  });

  describe('getPointersLikedBooksByUser', () => {
    it('should return books indicating which ones have been added to favourites', async () => {
      const userId = '2';

      const favoriteBooks = [books[0]];

      const user = {
        id: userId,
        favoriteBooks: favoriteBooks,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await bookService.getPointersLikedBooksByUser(userId, books);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
        relations: ['favoriteBooks'],
      });
      
      expect(result).toEqual(expactingDataForPointers);
    });

    it('should return books without specifying a favourite, if userId is not specified', async () => {
      const userId = null;

      const result = await bookService.getPointersLikedBooksByUser(userId, books);

      expect(mockBookRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(expectedDataWithoutUser);
    });
  });

  describe('uploadImageS3', () => {
    it('should upload an image to S3 and return the URL', async () => {
      const mockFile = {
        originalname: 'example.jpg',
        buffer: Buffer.from('fake image data'),
      } as Express.Multer.File;

      s3Mock.on(PutObjectCommand).resolves({});

      const result = await bookService.uploadImageS3(mockFile);

      expect(s3Mock.calls()).toHaveLength(1);
      expect(s3Mock.call(0).args[0].input).toEqual({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: mockFile.originalname,
        Body: mockFile.buffer,
      });

      expect(result).toBe(`https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/example.jpg`);
    });
  });

  describe('deleteImageS3', () => {
    it('should delete an image from S3', async () => {
      const coverImageLink = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/example.jpg`;
      s3Mock.on(DeleteObjectCommand).resolves({});

      await bookService.deleteImageS3(coverImageLink);

      expect(s3Mock.calls()[0].args[0].input).toEqual({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'example.jpg',
      });
    });
  });

  describe('getBooksLikedByUser', () => {
    it('should return books liked by the user', async () => {
      const userId = '1';
      books[1].favoritesCount = 1;
      const favoriteBooks = [books[1]];

      const user = {
        id: userId,
        favoriteBooks: favoriteBooks,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockBookRepository.find.mockResolvedValue(books);

      const result = await bookService.getBooksLikedByUser(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });
      expect(mockBookRepository.find).toHaveBeenCalledWith({
        where: { id: In(['2']) },
      });
      expect(result).toEqual(books);
    });
  });
});
