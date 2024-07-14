import { IsNumber } from 'class-validator';

export class PayForOrderDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  identificator: number;
}
