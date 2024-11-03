import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { LanguageService } from '../services/language.service';
import { Log } from '../decorators/log.decorator';

export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Log({ body: true, user: true })
  async createLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    const createLanguageDto = req.body;

    const language = await this.languageService.createLanguage(createLanguageDto);

    res.status(201).json(language);
  }

  @Log({ body: true, user: true })
  async updateLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = +req.user.id;

    const updateLanguageDto = req.body;

    const language = await this.languageService.updateLanguage(userId, updateLanguageDto);

    res.status(200).json(language);
  }

  @Log({ body: true, user: true })
  async deleteLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    await this.languageService.deleteLanguage(id);

    res.status(200).json({ message: 'Language has been deleted.' });
  }

  @Log({})
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const languages = await this.languageService.findAll();

    res.status(200).json(languages);
  }

  @Log({ params: true })
  async getLanguages(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const languages = await this.languageService.getLanguage(id);

    res.status(200).json(languages);
  }
}
