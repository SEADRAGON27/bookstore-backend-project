import { Repository } from 'typeorm';
import { AuthorEntity } from '../entities/author.entity';
import { CustomError } from '../interfaces/customError';
import { AuthorDto } from '../dto/author.dto';
import QueryString from 'qs';

export class AuthorService {
  constructor(private authorRepository: Repository<AuthorEntity>) {}

  async createAuthor(id: number, createAuthorDto: AuthorDto) {
    let author = new AuthorEntity();
    Object.assign(author, createAuthorDto);

    author = await this.authorRepository.save(author);

    return author;
  }

  async updateAuthor(id: number, updateAuthorDto: AuthorDto) {
    let author = await this.authorRepository.findOneBy({ id });

    if (!author) throw new CustomError(404, "Author doesn't exist.");

    Object.assign(author, updateAuthorDto);

    author = await this.authorRepository.save(author);

    return author;
  }

  async deleteAuthor(id: number) {
    const author = await this.authorRepository.findOneBy({ id });

    if (!author) throw new CustomError(404, "Author doesn't exist.");

    await this.authorRepository.delete(author);
  }

  async findAll(query: QueryString.ParsedQs) {
    const queryBuilder = this.authorRepository.createQueryBuilder('author');

    if (query.author) {
      const searchParam = query.author as string;
      const searchParamToLowerCase = searchParam.split('-');

      searchParamToLowerCase.forEach((element, index) => {
        queryBuilder.andWhere('author.fullName ILIKE :search' + index, {
          ['search' + index]: `%${element}%`,
        });
      });
    }

    if (query.cursor) queryBuilder.andWhere('author.id > :cursor', { cursor: query.cursor });

    const pageSize = 15;

    const authors = await queryBuilder
      .orderBy('author.id', 'ASC')
      .take(pageSize + 1)
      .getMany();

    const hasNextPage = authors.length > pageSize;

    if (hasNextPage) authors.pop();

    const nextCursor = hasNextPage ? authors[authors.length - 1].id : null;

    const authorListWithCursor = {
      authors: authors,
      nextCursor: nextCursor,
    };

    return authorListWithCursor;
  }

  async getAuthor(id: number) {
    return await this.authorRepository.findOneBy({ id });
  }
}
