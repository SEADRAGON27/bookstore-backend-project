import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { BookService } from '../services/book.service';
import { NextFunction, Request, Response } from 'express';
import { Log } from '../decorators/log.decorator';

export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Log({ user: true })
  async getBooksOnTheMainPage(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;
    const originalUrl = req.originalUrl;

    const books = await this.bookService.getBooksOnTheMainPage(userId, originalUrl);

    res.status(200).json(books);
  }

  @Log({ params: true, user: true, query: true })
  async getBooksByCategory(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;
    const category = req.params.name;
    const originalUrl = req.originalUrl;
    const query = req.query;

    const bookListWithCursor = await this.bookService.getBooksByCategory(userId, category, originalUrl, query);

    res.status(200).json(bookListWithCursor);
  }

  @Log({ user: true, query: true })
  async searchBook(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user ? req.user.id : null;
    const originalUrl = req.originalUrl;
    const query = req.query;

    const bookListWithCursor = await this.bookService.searchBook(userId, originalUrl, query);

    res.status(200).json(bookListWithCursor);
  }

  @Log({ params: true })
  async getBook(req: Request, res: Response, next: NextFunction) {
    const title = req.params.title;
    const book = await this.bookService.getBook(title);

    res.status(200).json(book);
  }

  @Log({ params: true, user: true })
  async addBookToFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    const comment = await this.bookService.addBookToFavorites(userId, id);

    res.status(200).json(comment);
  }

  @Log({ params: true, user: true })
  async deleteBookFromFavorites(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;

    const comment = await this.bookService.deleteBookFromFavorites(userId, id);

    res.status(200).json(comment);
  }

  @Log({ body: true, user: true })
  async createBook(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const image = req.file;
    const createBookDto = Object.assign({}, req.body);

    const book = await this.bookService.createBook(userId, createBookDto, image);

    res.status(201).json(book);
  }

  @Log({ params: true, user: true })
  async updateBook(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const id = req.params.id;
    const updateBookDTO = req.body;

    const book = await this.bookService.updateBook(userId, id, updateBookDTO);

    res.status(200).json(book);
  }

  @Log({ params: true })
  async deleteBook(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = req.params.id;

    await this.bookService.deleteBook(id);

    res.status(200).json({ message: 'Book has been deleted.' });
  }

  @Log({ user: true })
  async getBooksLikedByUser(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = req.user.id;

    const books = await this.bookService.getBooksLikedByUser(userId);

    res.status(200).json(books);
  }
}
