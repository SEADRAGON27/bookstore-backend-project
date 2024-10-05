import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { WinstonLoggerService } from '../logs/logger';
import { AuthorService } from '../services/author.service';
import { exceptionType } from '../utils/exceptionType';

export class AuthorController {
  constructor(
    private readonly authorService: AuthorService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createAuthorDto = req.body;

      const author = await this.authorService.createAuthor(createAuthorDto);

      res.status(201).json(author);

      this.logger.log(`Author created successfully`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating a new author : ${error.message}`);

      next(error);
    }
  }

  async updateAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateAuthorDto = req.body;
      const userId = +req.user.id;

      const author = await this.authorService.updateAuthor(userId, updateAuthorDto);

      res.status(200).json(author);

      this.logger.log(`Author updated successfully by user ${userId}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating author by user ${req.user?.id}: ${error.message}`);

      next(error);
    }
  }

  async deleteAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.authorService.deleteAuthor(id);

      res.status(200).json({ message: 'Author has been deleted.' });
      this.logger.log(`Author with ID ${id} deleted successfully`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting author with ID ${req.params.id}: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const authors = await this.authorService.findAll(query);

      res.status(200).json(authors);
      this.logger.log('Authors fetched successfully');
    } catch (error) {
      this.logger.error(`Error fetching authors: ${error.message}`);
      next(error);
    }
  }

  async getAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const author = await this.authorService.getAuthor(id);

      this.logger.log(`Author with ID ${id} fetched successfully`);
      res.status(200).json(author);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching author with ID ${req.params.id}: ${error.message}`);

      next(error);
    }
  }
}
