import { IsNumber, IsISBN, IsNotEmpty, IsOptional } from 'class-validator';
import { LanguageEntity } from '../entities/language.entity';
import { PublisherEntity } from '../entities/publishers.entity';
import { AuthorEntity } from '../entities/author.entity';
import { GenreEntity } from '../entities/genre.entity';
import { CategoryEntity } from '../entities/category.entity';

export class BookDto {
  @IsNotEmpty()
  title: string;

  @IsNumber()
  pagesQuantity: number;

  @IsNotEmpty()
  summary: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  originalPrice: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discountedPrice?: number;

  @IsNotEmpty()
  language: LanguageEntity;

  @IsISBN()
  isbn: string;

  @IsNotEmpty()
  category: CategoryEntity;

  @IsNumber()
  publicationYear: number;

  @IsNotEmpty()
  publisher: PublisherEntity;

  @IsNotEmpty()
  authors: AuthorEntity[];

  @IsNumber()
  availableBooks: number;

  @IsNotEmpty()
  genre: GenreEntity;
}
