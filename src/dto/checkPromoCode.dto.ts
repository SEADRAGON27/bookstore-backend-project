import { IsNotEmpty, IsNumber } from 'class-validator';

export class CheckPromoCode {
  @IsNotEmpty()
  @IsNumber()
  total_sum: number;

  @IsNotEmpty()
  code: string;
}
