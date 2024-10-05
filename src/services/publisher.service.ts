import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { PublisherDto } from '../dto/bookAttributes.dto';
import { PublisherEntity } from '../entities/publishers.entity';
import QueryString from 'qs';

export class PublisherService {
  constructor(private readonly publisherRepository: Repository<PublisherEntity>) {}

  async createPublisher(createPublisherDto: PublisherDto) {
    const publisher = await this.publisherRepository.findOneBy({ name: createPublisherDto.name });

    if (publisher) throw new CustomError(404, 'Publisher name is taken.');

    Object.assign(publisher, createPublisherDto);

    return await this.publisherRepository.save(publisher);
  }

  async updatePublisher(id: number, updatePublisherDto: PublisherDto) {
    const publisher = await this.publisherRepository.findOneBy({ id });

    if (!publisher) throw new CustomError(404, "Publisher doesn't exist.");

    Object.assign(publisher, updatePublisherDto);

    return await this.publisherRepository.save(publisher);
  }

  async deletePublisher(id: number) {
    const language = await this.publisherRepository.findOneBy({ id });

    if (!language) throw new CustomError(404, "Language doesn't exist.");

    await this.publisherRepository.delete(language);
  }

  async findAll(query: QueryString.ParsedQs) {
    const queryBuilder = this.publisherRepository.createQueryBuilder('publisher');

    if (query.publisher) {
      const searchParam = query.publisher as string;
      const searchParamToLowerCase = searchParam.split('-');

      searchParamToLowerCase.forEach((element, index) => {
        queryBuilder.andWhere('publisher.name ILIKE :search' + index, {
          ['search' + index]: `%${element}%`,
        });
      });
    }

    if (query.cursor) queryBuilder.andWhere('publisher.id > :cursor', { cursor: query.cursor });

    const pageSize = 15;

    const publishers = await queryBuilder
      .orderBy('publisher.id', 'ASC')
      .take(pageSize + 1)
      .getMany();

    const hasNextPage = publishers.length > pageSize;

    if (hasNextPage) publishers.pop();

    const nextCursor = hasNextPage ? publishers[publishers.length - 1].id : null;

    const publisherListWithCursor = {
      authors: publishers,
      nextCursor: nextCursor,
    };

    return publisherListWithCursor;
  }

  async getPublisher(id: number) {
    const publisher = await this.publisherRepository.findOneBy({ id });

    if (!publisher) throw new CustomError(404, 'Publisher doesn`t exist');

    return await this.publisherRepository.findOneBy({ id });
  }
}
