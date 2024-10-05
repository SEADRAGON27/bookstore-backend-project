import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { WinstonLoggerService } from '../logs/logger';
import { BookService } from '../services/book.service';
import { NextFunction, Request, Response } from 'express';
import { exceptionType } from '../utils/exceptionType';

export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async getBooksOnTheMainPage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const originalUrl = req.originalUrl;

      const books = await this.bookService.getBooksOnTheMainPage(userId, originalUrl);

      res.status(200).json(books);

      this.logger.log(`Fetching books for the main page successfully. User ID: ${userId}, URL: ${originalUrl}`);
    } catch (error) {
      this.logger.error(`Error fetching books for the main page: ${error.message}`);
      next(error);
    }
  }

  async getBooksByCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const category = req.params.name;
      const originalUrl = req.originalUrl;
      const query = req.query;

      const bookListWithCursor = await this.bookService.getBooksByCategory(userId, category, originalUrl, query);

      res.status(200).json(bookListWithCursor);

      this.logger.log(`Fetching books by category '${category}' successfully. User ID: ${userId}, URL: ${originalUrl}`);
    } catch (error) {
      this.logger.error(`Error fetching books by category '${req.params.name}': ${error.message}`);
      next(error);
    }
  }

  async searchBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const originalUrl = req.originalUrl;
      const query = req.query;

      const bookListWithCursor = await this.bookService.searchBook(userId, originalUrl, query);

      res.status(200).json(bookListWithCursor);

      this.logger.log(`Searching books successfully. User ID: ${userId}, URL: ${originalUrl}, Query: ${JSON.stringify(query)}`);
    } catch (error) {
      this.logger.error(`Error searching books: ${error.message}`);
      next(error);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction) {
    try {
      const title = req.params.title;
      const book = await this.bookService.getBook(title);

      res.status(200).json(book);

      this.logger.log(`Fetching book details for title '${title}' successfully.`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching book details for title '${req.params.title}': ${error.message}`);

      next(error);
    }
  }

  async addBookToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id;

      const comment = await this.bookService.addBookToFavorites(userId, id);

      res.status(200).json(comment);

      this.logger.log(`Adding book ID ${id} to favorites for user ID ${userId} successfully.`);
    } catch (error) {
      this.logger.error(`Error adding book ID ${req.params.id} to favorites: ${error.message}`);
      next(error);
    }
  }

  async deleteBookFromFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id;

      const comment = await this.bookService.deleteBookFromFavorites(userId, id);

      res.status(200).json(comment);

      this.logger.log(`Deleting book ID ${id} from favorites for user ID ${userId} successfully.`);
    } catch (error) {
      this.logger.error(`Error deleting book ID ${req.params.id} from favorites: ${error.message}`);
      next(error);
    }
  }

  async createBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const image = req.file;
      const createBookDto = Object.assign({}, req.body);

      const book = await this.bookService.createBook(userId, createBookDto, image);

      res.status(201).json(book);

      this.logger.log(`Creating a new book successfully. User ID: ${userId}, Data: ${JSON.stringify(createBookDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating a new book: ${error.message}`);

      next(error);
    }
  }

  async updateBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id;
      const updateBookDTO = req.body;

      const book = await this.bookService.updateBook(userId, id, updateBookDTO);

      res.status(200).json(book);

      this.logger.log(`Updating book ID ${id} successfully. User ID: ${userId}, Data: ${JSON.stringify(updateBookDTO)}`);
    } catch (error) {
      if (error) this.logger.error(`Error updating book ID ${req.params.id}: ${error.message}`);

      next(error);
    }
  }

  async deleteBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;

      await this.bookService.deleteBook(id);

      res.status(200).json({ message: 'Book has been deleted.' });

      this.logger.log(`Deleting book ID ${id} successfully.`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting book ID ${req.params.id}: ${error.message}`);

      next(error);
    }
  }

  async getBooksLikedByUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;

      const books = await this.bookService.getBooksLikedByUser(userId);

      res.status(200).json(books);

      this.logger.log(`Fetching books liked by user ID ${userId} successfully.`);
    } catch (error) {
      this.logger.error(`Error fetching books liked by user ID ${req.user.id}: ${error.message}`);
      next(error);
    }
  }
}
