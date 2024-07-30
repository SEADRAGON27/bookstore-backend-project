import { IsNumber, IsISBN, IsNotEmpty, IsOptional } from 'class-validator';

export class BookDto {
  @IsNotEmpty()
  title: string;

  @IsNumber()
  pages_quantity: number;

  @IsNotEmpty()
  summary: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  original_price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discounted_price?: number;

  @IsNotEmpty()
  language: string;

  @IsISBN()
  isbn: string;

  @IsNotEmpty()
  category: string;

  @IsNumber()
  publication_year: number;

  @IsNotEmpty()
  publisher: string;

  @IsNotEmpty()
  author: string;

  @IsNumber()
  available_books: number;

  @IsNotEmpty()
  genre: string;
}
