import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { AuthorService } from '../services/author.service';
import { Log } from '../decorators/log.decorator';

export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Log({ body: true, user: true })
  async createAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    const createAuthorDto = req.body;

    const author = await this.authorService.createAuthor(createAuthorDto);

    res.status(201).json(author);
  }

  @Log({ body: true, user: true })
  async updateAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    const updateAuthorDto = req.body;
    const userId = +req.user.id;

    const author = await this.authorService.updateAuthor(userId, updateAuthorDto);

    res.status(200).json(author);
  }

  @Log({ params: true, user: true })
  async deleteAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    await this.authorService.deleteAuthor(id);

    res.status(200).json({ message: 'Author has been deleted.' });
  }

  @Log({ query: true })
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const query = req.query;

    const authors = await this.authorService.findAll(query);

    res.status(200).json(authors);
  }

  @Log({ params: true })
  async getAuthor(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const author = await this.authorService.getAuthor(id);

    res.status(200).json(author);
  }
}
