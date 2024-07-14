import { IsNotEmpty } from 'class-validator';

export class CheckPromoCode {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  code: string;
}
