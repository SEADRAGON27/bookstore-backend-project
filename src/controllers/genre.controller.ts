import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { GenreService } from '../services/genre.service';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class GenreController {
  constructor(
    private readonly genreService: GenreService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createGenreDto = req.body;

      const genre = await this.genreService.createGenre(createGenreDto);

      res.status(201).json(genre);

      this.logger.log(`Genre created successfully. Genre Data: ${JSON.stringify(createGenreDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating a new genre. Error: ${error.message}`);

      next(error);
    }
  }

  async updateGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = +req.user.id;

    try {
      const updateGenreDto = req.body;

      const genre = await this.genreService.updateGenre(userId, updateGenreDto);

      res.status(200).json(genre);

      this.logger.log(`Genre updated successfully. User ID: ${userId}, Updated Data: ${JSON.stringify(updateGenreDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating genre. User ID: ${userId}, Error: ${error.message}`);

      next(error);
    }
  }

  async deleteGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      await this.genreService.deleteGenre(id);

      res.status(200).json({ message: 'Genre has been deleted.' });

      this.logger.log(`Genre fetched successfully. Genre ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting genre. Genre ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const genres = await this.genreService.findAll();

      res.status(200).json(genres);

      this.logger.log('Genres fetched successfully');
    } catch (error) {
      this.logger.error(`Error fetching genres. Error: ${error.message}`);
      next(error);
    }
  }

  async getGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const genre = await this.genreService.getGenre(id);

      res.status(200).json(genre);

      this.logger.log(`Genre fenched successfully. Genre ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching genre. Genre ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }
}
