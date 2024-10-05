import { IsNotEmpty } from 'class-validator';

export class BookAttributesDto {
  @IsNotEmpty()
  name: string;
}

export class PublisherDto extends BookAttributesDto {}
export class LanguageDto extends BookAttributesDto {}
export class GenreDto extends BookAttributesDto {}
export class CategoryDto extends BookAttributesDto {}
