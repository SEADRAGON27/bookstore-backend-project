import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { GenreEntity } from '../entities/genre.entity';
import { GenreDto } from '../dto/bookAttributes.dto';

export class GenreService {
  constructor(private readonly genreRepository: Repository<GenreEntity>) {}

  async createGenre(createGenreDto: GenreDto) {
    const genre = await this.genreRepository.findOneBy({ name: createGenreDto.name });

    if (genre) throw new CustomError(404, 'Genre name is taken.');

    return await this.genreRepository.save(genre);
  }

  async updateGenre(id: number, updateGenreDto: GenreDto) {
    const genre = await this.genreRepository.findOneBy({ id });

    if (!genre) throw new CustomError(404, "Genre doesn't exist.");

    Object.assign(genre, updateGenreDto);

    return await this.genreRepository.save(genre);
  }

  async deleteGenre(id: number) {
    const genre = await this.genreRepository.findOneBy({ id });

    if (!genre) throw new CustomError(404, "Genre doesn't exist.");

    await this.genreRepository.delete(genre);
  }

  async findAll() {
    const genres = await this.genreRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return genres;
  }

  async getGenre(id: number) {
    const genre = await this.genreRepository.findOneBy({ id });

    if (!genre) throw new CustomError(404, "Genre doesn't exist.");

    return await this.genreRepository.findOneBy({ id });
  }
}
