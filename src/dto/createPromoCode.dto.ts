import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
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
