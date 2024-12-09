import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CheckPromoCode {
  @IsNumber()
  @IsNotEmpty()
  totalSum: number;

  @IsString()
  @IsNotEmpty()
  code: string;
}
