/* eslint-disable padding-line-between-statements */
/* eslint-disable prettier/prettier */
import 'dotenv';
import { Redis } from 'ioredis';
import { Brackets, In, MoreThan, Repository, SelectQueryBuilder } from 'typeorm';
import { BookEntity } from '../entities/book.entity';
import { BookResponse, BookResponseMainPage, FavoritedBook } from '../interfaces/bookResponce.interface';
import QueryString from 'qs';
import { UserEntity } from '../entities/user.entity';
import { BookDto } from '../dto/book.dto';
import { CustomError } from '../interfaces/customError';
import { S3Service } from './s3Service';

export class BookService {
  constructor(
    private readonly clientRedis: Redis,
    private readonly bookRepository: Repository<BookEntity>,
    private readonly userRepository: Repository<UserEntity>,
    private readonly s3Servive:S3Service
  ) {}

  async getBooksOnTheMainPage(userId: string | null, originalUrl: string): Promise<BookResponseMainPage> {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const books = await Promise.all([
      this.bookRepository.find({
        where: { createdAt: MoreThan(lastWeek), availableBooks: MoreThan(0) },
        relations: ['authors'],
        take: 10,
      }),

      this.bookRepository.find({
        where: { discountedPrice: MoreThan(0), availableBooks: MoreThan(0) },
        relations: ['authors'],
        take: 10,
      }),

      this.bookRepository.find({
        order: { salesCount: 'DESC' },
        where: { availableBooks: MoreThan(0) },
        relations: ['authors'],
        take: 10,
      }),
    ]);

    const booksWithFavorited = await Promise.all(
      books.map(async (books) => {
        const booksWithPointer = await this.getPointersLikedBooksByUser(userId, books);

        return booksWithPointer;
      }),
    );

    const booksOnTheMainPage = {
      newBooks: booksWithFavorited[0],
      salesBooks: booksWithFavorited[1],
      bestsellerBooks: booksWithFavorited[2],
    };

    if (!userId) await this.clientRedis.setex(originalUrl, 3600000, JSON.stringify(booksOnTheMainPage));

    return booksOnTheMainPage;
  }

  async getBooksByCategory(userId: string, category: string, originalUrl: string, query: QueryString.ParsedQs): Promise<BookResponse> {
    const queryBuilder = this.bookRepository.createQueryBuilder('book').innerJoinAndSelect('book.category','category').innerJoinAndSelect('book.authors','author');

    queryBuilder.where('category.name = :category', { category: category });

    const bookListWithCursor = await this.queryBuilder(userId, originalUrl, queryBuilder, query);
    
    return bookListWithCursor;
  }

  async queryBuilder(userId: string, originalUrl: string, queryBuilder: SelectQueryBuilder<BookEntity>, query: QueryString.ParsedQs): Promise<BookResponse> {
    this.addGenre(query,queryBuilder);
    this.addPrice(query,queryBuilder);
    this.addPublisher(query,queryBuilder);
    this.addPublicationYear(query,queryBuilder);
    this.addSalesCount(query,queryBuilder);
    this.addNew(query,queryBuilder);
    this.addDiscountedPrice(query,queryBuilder);
    this.addAuthor(query,queryBuilder);
    this.addLanguage(query,queryBuilder);
    this.addCursor(query,queryBuilder);
    this.addCategory(query,queryBuilder);

    queryBuilder.andWhere('book.availableBooks > :availableBooks', {
      availableBooks: 0,
    });

    const pageSize = 30;

    const books = await queryBuilder
      .orderBy('book.id', 'ASC')
      .take(pageSize + 1)
      .getMany();
    
    const booksWithFavorited = await this.getPointersLikedBooksByUser(userId, books);
    const hasNextPage = booksWithFavorited.length > pageSize;

    if (hasNextPage) booksWithFavorited.pop();

    const nextCursor = hasNextPage ? booksWithFavorited[booksWithFavorited.length - 1].book.id : null;

    if (booksWithFavorited.length >= 1 && !userId) await this.clientRedis.setex(originalUrl, 3600000, JSON.stringify(booksWithFavorited));

    const bookListWithCursor = {
      books: booksWithFavorited,
      nextCursor: nextCursor,
    };

    return bookListWithCursor;
  }

  addGenre(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if(query.genre) 
      queryBuilder.innerJoinAndSelect('book.genre','genre').andWhere('genre.name = :genre', { genre: query.genre });
  }
  
  addPrice(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if(query.price){
    const price = query.price as string;
    const priceSorted = price.split('-');
    queryBuilder.andWhere('book.originalPrice between :from and :to', { from: priceSorted[0], to: priceSorted[1] })
    }
  }
  
  addPublisher(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.publisher) {
      const publisher = query.publisher as string;
      const modifiedPublisher = publisher.replace(/-/g, ' ');
      queryBuilder.innerJoinAndSelect('book.publisher','publisher').andWhere('publisher.name = :publisher', { publisher: modifiedPublisher});
    }
  }
  
  addPublicationYear(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.publicationYear) {
      const publicationYear = query.publicationYear as string;
      const publicationYearSorted = publicationYear.split('-');
      queryBuilder.andWhere('book.publicationYear between :from and :to', { from: publicationYearSorted[0], to: publicationYearSorted[1] });
    }
  }

  addSalesCount(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.salesCount) queryBuilder.andWhere('book.salesCount >= 100');
  }
  
  addNew(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.new) {
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);

      queryBuilder.andWhere('book.createdAt >= :lastWeek', { lastWeek: lastWeek });
    }
  }
  
  addDiscountedPrice(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.discountedPrice) queryBuilder.andWhere({ where: { discountedPrice: MoreThan(0) } });
  }
  
  addAuthor(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.author){
      const author = query.author as string;
      const modifiedAuthor = author.replace(/-/g, ' ');
      queryBuilder.innerJoinAndSelect('book.authors','author').andWhere('author.fullName = :author', { author: modifiedAuthor });
    } 
  }
  
  addLanguage(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.language) 
      queryBuilder.innerJoinAndSelect('book.language','language').andWhere('language.name = :language', { language: query.language });
  }
  
  addCursor(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if (query.cursor) queryBuilder.andWhere('book.id > :cursor', { cursor: query.cursor });
  }
  
  addCategory(query: QueryString.ParsedQs,queryBuilder: SelectQueryBuilder<BookEntity>){
    if(query.category) 
      queryBuilder.innerJoinAndSelect('book.category','category').where('category.name = :category', { category: query.category });
  }
  

  async searchBook(userId: string, originalUrl: string, query: QueryString.ParsedQs): Promise<BookResponse> {
    if (query.text) {
      const queryBuilder = this.bookRepository.createQueryBuilder('book').innerJoinAndSelect('book.authors', 'author');

      const searchParam = query.text as string;
      const searchParamToLowerCase = searchParam.split('-');

      searchParamToLowerCase.forEach((element, index) => {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('book.title ILIKE :search' + index, {
              ['search' + index]: `%${element}%`,
            }).orWhere('author.fullName ILIKE :search' + index, {
              ['search' + index]: `%${element}%`,
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
      where: { title, availableBooks: MoreThan(0) },
      relations: ['comments', 'comments.parentComment','authors','language','publisher','genre','category'],
    });
    
    if (!book) throw new CustomError(404, "Book doesn't exist");

    return book;
  }

  async addBookToFavorites(userId: string, id: string): Promise<BookEntity> {
    const book = await this.bookRepository.findOneBy({ id });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteBooks'],
    });

    const isNotFavorited = user.favoriteBooks.findIndex((bookInFavorites) => bookInFavorites.id === book.id) === -1;

    if (isNotFavorited) {
      user.favoriteBooks.push(book);
      book.favoritesCount++;

      await this.userRepository.manager.transaction(async (manager) => {
        await manager.save(user);
        await manager.save(book);
      });
    }

    return book;
  }

  async deleteBookFromFavorites(userId: string, id: string): Promise<BookEntity> {
    const book = await this.bookRepository.findOneBy({ id });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteBooks'],
    });

    const bookIndex = user.favoriteBooks.findIndex((bookInFavorites) => bookInFavorites.id === book.id);
    console.log(bookIndex);

    if (bookIndex >= 0) {
      user.favoriteBooks.splice(bookIndex, 1);
      book.favoritesCount--;
      
      await this.userRepository.manager.transaction(async (manager) => {
        await manager.save(user);
        await manager.save(book);
      });
      
    }

    return book;
  }

  async createBook(userId: string, createBookDto: BookDto, image:Express.Multer.File): Promise<BookEntity> {
    const bookTitle = await this.bookRepository.findOneBy({ title: createBookDto.title });

    if (bookTitle) throw new CustomError(403, 'Book title already exists, please select another one');
    
    const {authors,language,publisher,category,genre} = createBookDto;
    
    const book = new BookEntity();
    
    createBookDto.authors = JSON.parse(authors);
    createBookDto.genre = JSON.parse(genre);
    createBookDto.publisher = JSON.parse(publisher);
    createBookDto.category = JSON.parse(category);
    createBookDto.language = JSON.parse(language);
    
    Object.assign(book, createBookDto);
    
    book.user = await this.userRepository.findOneBy({id:userId});
    
    const imageLink = await this.s3Servive.uploadImage(image);
    
    book.coverImageLink = imageLink;
    return await this.bookRepository.save(book);
  
  }

  async updateBook(userId: string, id: string, updateBookDTO: BookDto): Promise<BookEntity> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!book) throw new CustomError(404, "Book doesn't exist.");

    book.user.id = userId;

    Object.assign(book, updateBookDTO);

    return await this.bookRepository.save(book);
  }

  async deleteBook(id: string) {
    const book = await this.bookRepository.findOneBy({id})

    if (!book) throw new CustomError(404, "Book doesn't exist.");

    await this.bookRepository.delete({ id });
    await this.s3Servive.deleteImage(book.coverImageLink);
  }

  async getPointersLikedBooksByUser(userId: string, books: BookEntity[]): Promise<FavoritedBook[]> {
    let favoriteIds: string[] = [];

    if (userId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favoriteBooks'],
      });

      favoriteIds = currentUser.favoriteBooks.map((favorite) => favorite.id);
    }

    const booksWithFavorited = books.map((book) => {
      const favorited = favoriteIds.includes(book.id);

      return { book, favorited };
    });

    return booksWithFavorited;
  }

  async getBooksLikedByUser(userId: string): Promise<BookEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteBooks'],
    });

    const ids = user.favoriteBooks.map((el) => el.id);

    const books = await this.bookRepository.find({ where: { id: In(ids) } });

    return books;
  }
}
