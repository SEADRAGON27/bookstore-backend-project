import { IsNotEmpty, IsNumber } from 'class-validator';

export class CheckPromoCode {
  @IsNumber()
  totalSum: number;

  @IsNotEmpty()
  code: string;
}
