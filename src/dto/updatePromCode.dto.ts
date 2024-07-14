import { IsOptional } from 'class-validator';

export class updatePromoCode {
  @IsOptional()
  code?: string;

  @IsOptional()
  discountPercent?: number;

  @IsOptional()
  maxDiscount?: number;

  @IsOptional()
  minOrderAmount?: number;

  @IsOptional()
  expirationDate?: Date;
}
