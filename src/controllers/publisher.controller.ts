import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PublisherService } from '../services/publisher.service';
import { logger } from '../logs/logger';

export class PublisherController {
  constructor(private publisherService: PublisherService) {}

  async createPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createPublisherDto = req.body;
      const userId = +req.user.id;

      const publisher = await this.publisherService.createPublisher(userId, createPublisherDto);

      res.status(201).json(publisher);

      logger.info({ userId, createPublisherDto }, 'Creating a new publisher successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error creating a new publisher');
      next(error);
    
    }
  }

  async updatePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updatePublisherDto = req.body;
      const userId = +req.user.id;

      const publisher = await this.publisherService.updatePublisher(userId, updatePublisherDto);

      res.status(200).json(publisher);
      logger.info({ userId, updatePublisherDto }, 'Updating publisher successfully');
    
    } catch (error) {
      
      logger.error(error, 'Error updating publisher');
      next(error);
    
    }
  }

  async deletePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      await this.publisherService.deletePublisher(id);

      res.status(200).json({ message: 'Publisher has been deleted.' });
      logger.info({ id }, 'Deleting a publisher successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error delating publisher');
      next(error);
    
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const publishers = await this.publisherService.findAll(query);

      res.send(200).json(publishers);
      logger.info('Fetching publishers successfully');
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching publishers');
      next(error);
    
    }
  }

  async getPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const id = +req.params.id;

      const author = await this.publisherService.getPublisher(id);

      logger.info({ id }, 'Fetching publisher is successfully');
      res.status(200).json(author);
    
    } catch (error) {
      
      logger.error({ error }, 'Error fetching publisher');
      next(error);
    
    }
  }
}
