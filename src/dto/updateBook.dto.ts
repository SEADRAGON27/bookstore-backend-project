import { IsISBN, IsNumber, IsOptional } from 'class-validator';

export class updateBookDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  pages_quantity?: number;

  @IsOptional()
  summary?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  original_price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discounted_price?: number;

  @IsOptional()
  language?: string;

  @IsOptional()
  @IsISBN()
  isbn?: string;

  @IsOptional()
  category?: string;

  @IsOptional()
  publication_year?: number;

  @IsOptional()
  publisher?: string;

  @IsOptional()
  author?: string;

  @IsOptional()
  available_books?: number;

  @IsOptional()
  genre?: string;
}
