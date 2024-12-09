import { IsNumber, IsISBN, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  pagesQuantity: number;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @Type(() => Number)
  originalPrice: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Type(() => Number)
  discountedPrice?: number;

  @IsNumber()
  @IsNotEmpty()
  authors: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsISBN()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  publicationYear: number;

  @IsString()
  @IsNotEmpty()
  publisher: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  availableBooks: number;

  @IsString()
  @IsNotEmpty()
  genre: string;
}
