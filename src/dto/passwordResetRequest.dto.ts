import { IsEmail } from 'class-validator';

export class PasswordResetRequestDTO {
  @IsEmail()
  email: string;
}
