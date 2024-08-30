import { IsNotEmpty } from 'class-validator';

export class AuthorDto {
  @IsNotEmpty()
  fullName: string;
}
