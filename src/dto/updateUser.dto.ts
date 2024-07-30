import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @IsNotEmpty()
  readonly username?: string;

  @IsEmail({}, { message: 'Email must be a valid.' })
  readonly email?: string;
}
