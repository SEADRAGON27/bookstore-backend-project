import { IsNotEmpty } from 'class-validator';

export class PasswordResetDTO {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  newPassword: string;
}
