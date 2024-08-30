import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { logger } from '../logs/logger';
import { LanguageService } from '../services/language.service';

export class LanguageController {
  constructor(private languageService: LanguageService) {}

  async createLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createLanguageDto = req.body;
      const userId = +req.user.id;

      const language = await this.languageService.createLanguage(userId, createLanguageDto);

      res.status(201).json(language);
      logger.info({ userId, createLanguageDto }, 'Creating a new language successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating a new language');
      next(error);
    
    }
  }

  async updateLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updateLanguageDto = req.body;
      const userId = +req.user.id;

      const language = await this.languageService.updateLanguage(userId, updateLanguageDto);

      res.status(200).json(language);
      logger.info({ userId, updateLanguageDto }, 'Updating language successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating language');
      next(error);
    
    }
  }

  async deleteLanguage(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.languageService.deleteLanguage(id);

      res.status(200).json({ message: 'language has been deleted.' });
      logger.info({ id }, 'Deleting a language successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error delating language');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {

      const languages = await this.languageService.findAll();

      res.send(200).json(languages);
      logger.info('Fetching languages successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching languages');
      next(error);
    
    }
  }

  async getLanguages(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const languages = await this.languageService.getLanguage(id);

      logger.info({ id }, 'Fetching languages is successfully');
      res.status(200).json(languages);
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching languages');
      next(error);
    
    }
  }
}