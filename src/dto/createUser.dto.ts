import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  confirmedPassword: string;
}

export class CreateUserGoogleDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  token: string;
}
