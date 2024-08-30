import { IsNotEmpty } from 'class-validator';

export class PasswordResetDTO {
  @IsNotEmpty()
  newPassword: string;
}
