import { IsNotEmpty, IsOptional } from 'class-validator';

export class createPromoCode {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  discountPercent: number;

  @IsOptional()
  maxDiscount: number;

  @IsOptional()
  minOrderAmount: number;

  @IsOptional()
  expirationDate: Date;
}
