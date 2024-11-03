import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../interfaces/expressRequest.interface';
import { PublisherService } from '../services/publisher.service';
import { Log } from '../decorators/log.decorator';

export class PublisherController {
  constructor(private publisherService: PublisherService) {}

  @Log({ body: true, user: true })
  async createPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const createPublisherDto = req.body;

    const publisher = await this.publisherService.createPublisher(createPublisherDto);

    res.status(201).json(publisher);
  }

  @Log({ body: true, user: true })
  async updatePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const updatePublisherDto = req.body;
    const userId = +req.user.id;

    const publisher = await this.publisherService.updatePublisher(userId, updatePublisherDto);

    res.status(200).json(publisher);
  }

  @Log({ body: true, user: true })
  async deletePublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    await this.publisherService.deletePublisher(id);

    res.status(200).json({ message: 'Publisher has been deleted.' });
  }

  @Log({})
  async findAll(req: ExpressRequest, res: Response, next: NextFunction) {
    const query = req.query;

    const publishers = await this.publisherService.findAll(query);

    res.status(200).json(publishers);
  }

  @Log({ params: true })
  async getPublisher(req: ExpressRequest, res: Response, next: NextFunction) {
    const id = +req.params.id;

    const publisher = await this.publisherService.getPublisher(id);

    res.status(200).json(publisher);
  }
}
