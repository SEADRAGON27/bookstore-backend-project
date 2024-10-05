import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PublisherService } from '../services/publisher.service';
import { WinstonLoggerService } from '../logs/logger';
import { exceptionType } from '../utils/exceptionType';

export class PublisherController {
  constructor(
    private publisherService: PublisherService,
    private logger: WinstonLoggerService,
  ) {}

  async createPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const createPublisherDto = req.body;

      const publisher = await this.publisherService.createPublisher(createPublisherDto);

      res.status(201).json(publisher);

      this.logger.log(`Publisher created successfully. Publisher Data: ${JSON.stringify(createPublisherDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error creating publisher. Error: ${error.message}`);

      next(error);
    }
  }

  async updatePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const updatePublisherDto = req.body;
      const userId = +req.user.id;

      const publisher = await this.publisherService.updatePublisher(userId, updatePublisherDto);

      res.status(200).json(publisher);

      this.logger.log(`Publisher updated successfully. User ID: ${userId}, Updated Data: ${JSON.stringify(updatePublisherDto)}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error updating publisher. User ID: ${req.user.id}, Error: ${error.message}`);

      next(error);
    }
  }

  async deletePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      await this.publisherService.deletePublisher(id);

      res.status(200).json({ message: 'Publisher has been deleted.' });

      this.logger.log(`Publisher deleted successfully. Publisher ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error deleting publisher. Publisher ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }

  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query;

      const publishers = await this.publisherService.findAll(query);

      res.status(200).json(publishers);

      this.logger.log(`Publishers fetched successfully. Query: ${JSON.stringify(query)}`);
    } catch (error) {
      this.logger.error(`Error fetching publishers. Error: ${error.message}`);
      next(error);
    }
  }

  async getPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    try {
      const publisher = await this.publisherService.getPublisher(id);

      res.status(200).json(publisher);

      this.logger.log(`Publisher fetched successfully. Publisher ID: ${id}`);
    } catch (error) {
      if (exceptionType(error)) this.logger.error(`Error fetching publisher. Publisher ID: ${id}, Error: ${error.message}`);

      next(error);
    }
  }
}
