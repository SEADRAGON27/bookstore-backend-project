import { Redis } from 'ioredis';
import { Brackets, In, MoreThan, Repository, SelectQueryBuilder } from 'typeorm';
import { BookEntity } from '../entities/book.entity';
import { BookResponse } from '../interfaces/bookResponce.interface';
import QueryString from 'qs';
import { UserEntity } from '../entities/user.entity';
import { createBookDto } from '../dto/createBook.dto';
import { CustomError } from '../interfaces/customError';
import { s3 } from '../configs/s3.config';
import { logger } from '../logs/logger';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import 'dotenv';
import { updateBookDto } from '../dto/updateBook.dto';

export class BookService {
  constructor(
    private clientRedis: Redis,
    private bookRepository: Repository<BookEntity>,
    private userRepository: Repository<UserEntity>,
  ) {}

  async getBooksOnTheMainPage(userId: number, originalUrl: string): Promise<Record<string, BookEntity[]>> {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const booksCategories = await Promise.all([
      this.bookRepository.find({
        where: { created_at: MoreThan(lastWeek), available_books: MoreThan(0) },
        take: 10,
      }),

      this.bookRepository.find({
        where: { discounted_price: MoreThan(0), available_books: MoreThan(0) },
        take: 10,
      }),

      this.bookRepository.find({
        order: { sales_count: 'DESC' },
        where: { available_books: MoreThan(0) },
        take: 10,
      }),
    ]);

    let booksWithFavorited = [];
    booksCategories.forEach(async (category) => (booksWithFavorited = await this.getPointersLikedBooksByUser(userId, category)));

    const booksOnTheMainPage = {
      newBooks: booksWithFavorited[0],
      salesBooks: booksWithFavorited[1],
      bestsellerBooks: booksWithFavorited[2],
    };

    await this.clientRedis.setex(originalUrl, 3600000, JSON.stringify(booksOnTheMainPage));

    return booksOnTheMainPage;
  }

  async getBooksByCategory(userId: number, category: string, originalUrl: string, query: QueryString.ParsedQs): Promise<BookResponse | null> {
    const queryBuilder = this.bookRepository.createQueryBuilder('book');

    queryBuilder.where('book.category = :category', { category: category, available_books: MoreThan(0) });

    const bookListWithCursor = await this.queryBuilder(userId, originalUrl, queryBuilder, query);

    return bookListWithCursor;
  }

  async queryBuilder(userId: number, originalUrl: string, queryBuilder: SelectQueryBuilder<BookEntity>, query: QueryString.ParsedQs): Promise<BookResponse | null> {
    if (query.genre) queryBuilder.andWhere('book.genre = :genre', { genre: query.genre });

    if (query.price) {
      const price = query.price as string;
      const priceSorted = price.split('-');
      queryBuilder.andWhere('book.original_price between :from and :to', { from: priceSorted[0], to: priceSorted[1] });
    }

    if (query.publisher) queryBuilder.andWhere('books.publisher = :publisher', { publisher: query.publisher });

    if (query.publication_year) {
      const publicationYear = query.publication_year as string;
      const puplicationYearSorted = publicationYear.split('-');

      queryBuilder.andWhere('book.publication_year beetweem :from and :to', { from: puplicationYearSorted[0], to: publicationYear[1] });
    }

    if (query.sales_count) queryBuilder.andWhere('book.sales_count >= 100', { sales_count: query.sales_count });

    if (query.new) {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);

      queryBuilder.andWhere('book.created_at >= :lastWeek', { lastWeek: lastWeek });
    }

    if (query.discounted_price) queryBuilder.andWhere({ where: { discounted_price: MoreThan(0) } });

    if (query.author) queryBuilder.andWhere('book.author = :author', { author: query.author });

    if (query.language) queryBuilder.andWhere('book.language = :language', { language: query.language });

    if (query.cursor) queryBuilder.andWhere('book.id > :cursor', { cursor: query.cursor });

    const pageSize = 30;

    const books = await queryBuilder
      .orderBy('book.id', 'ASC')
      .take(pageSize + 1)
      .getMany();

    const booksWithFavorited = await this.getPointersLikedBooksByUser(userId, books);
    const hasNextPage = books.length > pageSize;

    if (hasNextPage) books.pop();

    const nextCursor = hasNextPage ? books[books.length - 1].id : null;

    await this.clientRedis.setex(originalUrl, 3600000, JSON.stringify(books));

    const bookListWithCursor = {
      books: booksWithFavorited,
      nextCursor: nextCursor,
    };

    return bookListWithCursor;
  }

  async searchBook(userId: number, originalUrl: string, query: QueryString.ParsedQs): Promise<BookResponse | null> {
    if (query.param) {
      const queryBuilder = this.bookRepository.createQueryBuilder('book');

      const searchParam = query.param as string;
      const searchParamToLowerCase = searchParam.toLowerCase().split('-');

      searchParamToLowerCase.forEach((element, index) => {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('book.title LIKE :search' + index, {
              ['search' + index]: `%${element}%`,
              available_books: MoreThan(0),
            }).orWhere('book.author LIKE :search' + index, {
              ['search' + index]: `%${element}%`,
              available_books: MoreThan(0),
            });
          }),
        );
      });

      const bookListWithCursor = await this.queryBuilder(userId, originalUrl, queryBuilder, query);

      return bookListWithCursor;
    }
  }

  async getBook(title: string): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({
      where: { title, available_books: MoreThan(0) },
      relations: ['comments', 'comments.parentComment'],
    });

    return book;
  }

  async addBookToFavorites(userId: number, id: number): Promise<BookEntity> {
    const book = await this.bookRepository.findOneBy({ id });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorite_books'],
    });

    const isNotFavorited = user.favorite_books.findIndex((commentInFavorites) => commentInFavorites.id === book.id) === -1;

    if (isNotFavorited) {
      user.favorite_books.push(book);
      book.favorites_count++;

      await this.userRepository.save(user);
      await this.bookRepository.save(book);
    }

    return book;
  }

  async deleteBookToFavorites(userId: number, id: number): Promise<BookEntity> {
    const book = await this.bookRepository.findOneBy({ id });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorite_books'],
    });

    const commentIndex = user.favorite_comments.findIndex((commentInFavorites) => commentInFavorites.id === book.id);

    if (commentIndex) {
      user.favorite_comments.splice(commentIndex, 1);
      book.favorites_count--;

      await this.userRepository.save(user);
      await this.bookRepository.save(book);
    }

    return book;
  }

  async createBook(userId: number, createBookDto: createBookDto): Promise<BookEntity> {
    const book = new BookEntity();
    Object.assign(book, createBookDto);

    book.user = await this.userRepository.findOneBy({ id: userId });

    return await this.bookRepository.save(book);
  }

  async updateBook(userId: number, id: number, updateBookDTO: updateBookDto): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!book) throw new CustomError(404, "Book doesn't exist.");

    book.user.id = userId;

    Object.assign(book, updateBookDTO);

    return await this.bookRepository.save(book);
  }

  async deleteBook(id: number) {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!book) throw new CustomError(404, "Book doesn't exist.");

    await this.bookRepository.delete({ id });
    await this.deleteImageS3(book.cover_image_link);
  }

  async getPointersLikedBooksByUser(userId: number, books: BookEntity[]) {
    let favoriteIds: number[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorite_books'],
      });

      favoriteIds = currentUser.favorite_books.map((favorite) => favorite.id);
    }

    const booksWithFavorited = books.map((book) => {
      const favorited = favoriteIds.includes(book.id);

      return { ...book, favorited };
    });

    return booksWithFavorited;
  }

  async uploadImageS3(file: Express.Multer.File) {
    if (!file) new CustomError(400, 'No file uploaded.');

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: file.originalname,
      Body: file.buffer,
    };

    console.log(uploadParams);
    const command = new PutObjectCommand(uploadParams);

    await s3.send(command);
    const imageUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${uploadParams.Key}`;
    logger.info(`File uploaded successfully ${imageUrl}`);

    return imageUrl;
  }

  async deleteImageS3(coverImageLink: string) {
    const s3UrlPrefix = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}`;

    const imagePath = coverImageLink.replace(s3UrlPrefix, '').slice(1);

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: imagePath,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    logger.info(`File deleted successfully ${coverImageLink}`);
  }

  async getBooksLikedByUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorite_books'],
    });

    const ids = user.favorite_books.map((el) => el.id);

    return await this.bookRepository.find({ where: { id: In(ids) } });
  }
}
