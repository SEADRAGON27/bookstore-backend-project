import { IsArray, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

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

  @IsIn(['card', 'cash'], {
    message: 'paymentMethod must be correct',
  })
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  totalSum: number;

  @IsArray()
  @IsNotEmpty()
  books: string[];

  @IsIn(['Nova Poshta', 'pickup'], {
    message: 'deliveryMethod must be correct',
  })
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
