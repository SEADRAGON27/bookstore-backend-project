import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PromoCode {
  @IsNotEmpty()
  code: string;

  @IsNumber()
  discountPercent: number;

  @IsOptional()
  @IsNumber()
  maxDiscount: number;

  @IsOptional()
  @IsNumber()
  minOrderAmount: number;

  @IsOptional()
  expirationDate: Date;
}
