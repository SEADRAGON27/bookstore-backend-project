import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  readonly username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid.' })
  readonly email?: string;
}
