import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  username: string;

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

  @IsNumber()
  totalSum: number;

  @IsNotEmpty()
  books: number[];

  @IsNotEmpty()
  deliveryMethod: string;

  @IsNotEmpty()
  branchAddress: string;

  @IsOptional()
  promoCode: string;

  @IsNumber()
  quantityOfBooks: number;
}
