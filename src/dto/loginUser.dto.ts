import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
