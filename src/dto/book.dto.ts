import { IsNumber, IsISBN, IsNotEmpty, IsOptional, IsArray, IsString } from 'class-validator';
import { LanguageEntity } from '../entities/language.entity';
import { PublisherEntity } from '../entities/publishers.entity';
import { AuthorEntity } from '../entities/author.entity';
import { GenreEntity } from '../entities/genre.entity';
import { CategoryEntity } from '../entities/category.entity';
import { Type } from 'class-transformer';

export class BookDto {
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Type(() => Number)
  pagesQuantity: number;

  @IsNotEmpty()
  summary: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  originalPrice: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  discountedPrice?: number;

  @IsNotEmpty()
  authors: string;

  @IsNotEmpty()
  language: string;

  @IsISBN()
  isbn: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  @Type(() => Number)
  publicationYear: number;

  @IsNotEmpty()
  publisher: string;

  @IsNumber()
  @Type(() => Number)
  availableBooks: number;

  @IsNotEmpty()
  genre: string;
}
