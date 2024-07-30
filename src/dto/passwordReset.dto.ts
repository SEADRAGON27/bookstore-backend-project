import { IsNotEmpty } from 'class-validator';

export class PasswordResetDTO {
  @IsNotEmpty()
  new_password: string;
}
