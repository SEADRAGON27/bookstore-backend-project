import { IsDataURI, IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PromoCode {
  @IsNotEmpty()
  code: string;

  @IsNumber()
  discount_percent: number;

  @IsOptional()
  @IsNumber()
  max_discount: number;

  @IsOptional()
  @IsNumber()
  min_order_amount: number;

  @IsOptional()
  expiration_date: Date;
}
