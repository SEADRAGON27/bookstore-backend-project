import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator';

export class OrderDto {
  @IsNotEmpty()
  user_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsPhoneNumber('UA')
  phone_number: string;

  @IsEmail({}, { message: 'Email must be a valid.' })
  email: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  payment_method: string;

  @IsNumber()
  total_sum:number

  @IsNotEmpty()
  books : number[]
  
  @IsNotEmpty()
  delivery_method: string;

  @IsNotEmpty()
  branch_address: string;

  @IsOptional()
  promo_code: string;

  @IsNumber()
  quantity_of_books:number
}
