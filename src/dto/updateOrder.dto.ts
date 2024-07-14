import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class updateOrderDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('UA')
  phoneNumber?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid.' })
  email?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  paymentMethod?: string;

  @IsOptional()
  amount?: string;

  @IsOptional()
  deliveryMethod?: string;

  @IsOptional()
  branchAdress?: string;

  @IsOptional()
  promoCode?: string;

  @IsOptional()
  totalAmount?: number;
}
