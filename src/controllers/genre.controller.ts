import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { GenreService } from '../services/genre.service';
import { logger } from '../logs/logger';

export class GenreController {
  constructor(private genreService: GenreService) {}

  async createGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createGenreDto = req.body;
      const userId = +req.user.id;

      const genre = await this.genreService.createGenre(userId, createGenreDto);

      res.status(201).json(genre);
      logger.info({ userId, createGenreDto }, 'Creating a new genre successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating a new genre');
      next(error);
    
    }
  }

  async updateGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateGenreDto = req.body;
      const userId = +req.user.id;

      const genre = await this.genreService.updateGenre(userId, updateGenreDto);

      res.status(200).json(genre);
      logger.info({ userId, updateGenreDto }, 'Updating genre successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating genre');
      next(error);
    
    }
  }

  async deleteGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.genreService.deleteGenre(id);

      res.status(200).json({ message: 'Genre has been deleted.' });
      logger.info({ id }, 'Deleting a genre successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error delating genre');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {

      const genres = await this.genreService.findAll();

      res.send(200).json(genres);
      logger.info('Fetching genres successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching genres');
      next(error);
    
    }
  }

  async getGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const genre = await this.genreService.getGenre(id);

      logger.info({ id }, 'Fetching genre is successfully');
      res.status(200).json(genre);
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching genre');
      next(error);
    
    }
  }
}
