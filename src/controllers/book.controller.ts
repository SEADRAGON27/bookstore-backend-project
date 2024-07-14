import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { logger } from '../logs/logger';
import { BookService } from '../services/book.service';
import { NextFunction, Request, Response } from 'express';

export class BookController {
  constructor(private bookService: BookService) {}

  async getBooksOnTheMainPage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user ? req.user.id : null;
      const originalUrl = req.originalUrl;

      const books = await this.bookService.getBooksOnTheMainPage(userId, originalUrl);

      res.status(200).json(books);
      logger.info({ userId, originalUrl }, 'Fetching books for the main page successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching books for the main page');
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
      logger.info({ userId, category, originalUrl, query }, 'Fetching books by category successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching books by category ');
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
      logger.info({ userId, originalUrl, query }, 'Searching books successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error searching books');
      next(error);
    
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction) {
    try {
      const title = req.params.title;
      const book = await this.bookService.getBook(title);

      res.status(200).json(book);
      logger.info({ title }, 'Fetching book details successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching book details');
      next(error);
    
    }
  }

  async addBookToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;

      const comment = await this.bookService.addBookToFavorites(userId, id);

      res.status(200).json(comment);
      logger.info({ userId, id }, 'Adding book to favorites successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error adding book to favorites');
      next(error);
    
    }
  }

  async deleteBookToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;

      const comment = await this.bookService.deleteBookToFavorites(userId, id);

      res.status(200).json(comment);
      logger.info({ userId, id }, 'Deleting book from favorites');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting book from favorites');
      next(error);
    
    }
  }

  async createBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const createBookDto = req.body;

      const book = await this.bookService.createBook(userId, createBookDto);

      res.status(201).json(book);
      logger.info({ userId, createBookDto }, 'Creating a new book successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating a new book');
      next(error);
    
    }
  }

  async updateBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const id = req.params.id as unknown as number;
      const updateBookDTO = req.body;

      const book = await this.bookService.updateBook(userId, id, updateBookDTO);

      res.status(200).json(book);
      logger.info({ userId, id, updateBookDTO }, 'Updating book details successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating book details');
      next(error);
    
    }
  }

  async deleteBook(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as unknown as number;

      await this.bookService.deleteBook(id);

      res.sendStatus(200);
      logger.info({ id }, 'Deleting a book successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error deleting a book');
      next(error);
    
    }
  }

  async getBooksLikedByUser(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const books = await this.bookService.getBooksLikedByUser(userId);

      res.status(200).json(books);
      logger.info({ userId }, 'Fetching books liked by user successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error fetching books liked by user');
      next(error);
    
    }
  }

  async uploadImage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const imageLink = await this.bookService.uploadImageS3(image);

      res.status(200).json(imageLink);
      logger.info({ image }, 'Uploading image successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error uploading image');
      next(error);
    
    }
  }

  async deleteImage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const imageLink = req.body.imageLink;

      await this.bookService.deleteImageS3(imageLink);

      res.status(200).json({ message: 'Image has been deleted.' });

      logger.info({ imageLink }, 'Deleting image successfully');
    } catch (error) {
      
      logger.error(error, 'Error deleting image');
      next(error);
    
    }
  }
}
