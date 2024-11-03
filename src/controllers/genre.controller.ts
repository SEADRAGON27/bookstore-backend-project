import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { GenreService } from '../services/genre.service';
import { Log } from '../decorators/log.decorator';

export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Log({ body: true, user: true })
  async createGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const createGenreDto = req.body;

    const genre = await this.genreService.createGenre(createGenreDto);

    res.status(201).json(genre);
  }

  @Log({ body: true, user: true })
  async updateGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = +req.user.id;

    const updateGenreDto = req.body;

    const genre = await this.genreService.updateGenre(userId, updateGenreDto);

    res.status(200).json(genre);
  }

  @Log({ params: true, user: true })
  async deleteGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    await this.genreService.deleteGenre(id);

    res.status(200).json({ message: 'Genre has been deleted.' });
  }

  @Log({})
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const genres = await this.genreService.findAll();

    res.status(200).json(genres);
  }

  @Log({ params: true })
  async getGenre(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const genre = await this.genreService.getGenre(id);

    res.status(200).json(genre);
  }
}
