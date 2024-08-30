import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { logger } from '../logs/logger';
import { AuthorService } from '../services/author.service';

export class AuthorController {
  constructor(private authorService: AuthorService) {}

  async createAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createAuthorDto = req.body;
      const userId = +req.user.id;
      
      const author = await this.authorService.createAuthor(userId, createAuthorDto);

      res.status(201).json(author);

      logger.info({ userId, createAuthorDto }, 'Creating a new author successfully');
    } catch (error) {
      
      logger.error(error, 'Error creating a new author');
      next(error);
    
    }
  }

  async updateAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateAuthorDto = req.body;
      const userId = +req.user.id;
      
      const author = await this.authorService.updateAuthor(userId, updateAuthorDto);

      res.status(200).json(author);
      logger.info({ userId, updateAuthorDto }, 'Updating author successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating author');
      next(error);
    
    }
  }

  async deleteAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.authorService.deleteAuthor(id);

      res.status(200).json({ message: 'Author has been deleted.' });
      logger.info({ id }, 'Deleting a author successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error delating author');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction){
    try{
      const query = req.query;

      const authors = await this.authorService.findAll(query);

      res.status(200).json(authors);
      logger.info('Fetching authors successfully');
    
    } catch(error) {
      
      logger.error({ error }, 'Error fetching authors');
      next(error);
   
    }
  }
  
  async getAuthor(req: ExpressRequest, res: Response, next: NextFunction){
    try{
      const id = +req.params.id;
      
      const author = await this.authorService.getAuthor(id);
      
      logger.info({ id }, 'Fetching author is successfully');
      res.status(200).json(author);
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching author');
      next(error);
    
    }
  }
}
