import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './createUser.dto';
import { PartialType } from '@nestjs/mapped-types';

/*export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;
}*/

export class UpdateUserDto extends PartialType(CreateUserDto) {}
