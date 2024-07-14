import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginUserDTO {
  @IsEmail({}, { message: 'Email must be a valid.' })
  @Length(1, 15)
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
