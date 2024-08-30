import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsNotEmpty()
  password: string;
}
