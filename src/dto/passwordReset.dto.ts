import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordResetDTO {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
