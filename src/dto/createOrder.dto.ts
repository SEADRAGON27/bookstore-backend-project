import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from 'class-validator';

export class createOrderDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  lastName: string;

  @IsPhoneNumber('UA')
  phoneNumber: string;

  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  paymentMethod: string;

  @IsNotEmpty()
  amount: string;

  @IsNotEmpty()
  deliveryMethod: string;

  @IsNotEmpty()
  branchAdress: string;

  @IsOptional()
  promoCode: string;
}
