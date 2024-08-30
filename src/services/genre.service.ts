import { Repository } from 'typeorm';
import { CustomError } from '../interfaces/customError';
import { GenreEntity } from '../entities/genre.entity';
import { BookAttributesDto } from '../dto/bookAttributes.dto';

export class GenreService {
  constructor(private genreRepository: Repository<GenreEntity>) {}

  async createGenre(id: number, createGenreDto: BookAttributesDto) {
    let genre = new GenreEntity();
    Object.assign(genre, createGenreDto);

    genre = await this.genreRepository.save(genre);

    return genre;
  }

  async updateGenre(id: number, updateGenreDto: BookAttributesDto) {
    let genre = await this.genreRepository.findOneBy({ id });

    if (!genre) throw new CustomError(404, "Genre doesn't exist.");

    Object.assign(genre, updateGenreDto);

    genre = await this.genreRepository.save(genre);

    return genre;
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
    return await this.genreRepository.findOneBy({ id });
  }
}
