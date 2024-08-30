import { IsNotEmpty } from 'class-validator';

export class BookAttributesDto {
  @IsNotEmpty()
  name: string;
}
