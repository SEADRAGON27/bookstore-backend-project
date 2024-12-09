import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsPhoneNumber('UA')
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  totalSum: number;

  @IsNumber()
  @IsNotEmpty()
  books: number[];

  @IsString()
  @IsNotEmpty()
  deliveryMethod: string;

  @IsString()
  @IsNotEmpty()
  branchAddress: string;

  @IsString()
  @IsOptional()
  promoCode: string;

  @IsNumber()
  @IsNotEmpty()
  quantityOfBooks: number;
}
