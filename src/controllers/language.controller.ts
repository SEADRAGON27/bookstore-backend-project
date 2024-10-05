import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { LanguageService } from '../services/language.service';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class LanguageController {
  constructor(
    private readonly languageService: LanguageService,
    private readonly logger: WinstonLoggerService,
  ) {}

  async createLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createLanguageDto = req.body;

      const language = await this.languageService.createLanguage(createLanguageDto);

      res.status(201).json(language);

      this.logger.log(`Language created successfully. Language Data: ${JSON.stringify(createLanguageDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating language. Error: ${error.message}`);

      next(error);
    }
  }

  async updateLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    const userId = +req.user.id;

    try {
      const updateLanguageDto = req.body;

      const language = await this.languageService.updateLanguage(userId, updateLanguageDto);

      res.status(200).json(language);

      this.logger.log(`Language updated successfully. User ID: ${userId}, Updated Data: ${JSON.stringify(updateLanguageDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating language. User ID: ${userId}, Error: ${error.message}`);

      next(error);
    }
  }

  async deleteLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      await this.languageService.deleteLanguage(id);

      res.status(200).json({ message: 'Language has been deleted.' });

      this.logger.log(`Language deleted successfully. Language ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting language. Language ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const languages = await this.languageService.findAll();

      res.status(200).json(languages);

      this.logger.log('Languages fetched successfully');
    } catch (error) {
      this.logger.error(`Error fetching languages. Error: ${error.message}`);
      next(error);
    }
  }

  async getLanguages(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const languages = await this.languageService.getLanguage(id);

      res.status(200).json(languages);

      this.logger.log(`Languages fetched successfully. Language ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching languages. Language ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }
}
