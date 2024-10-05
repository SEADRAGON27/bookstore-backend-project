import { CreatePromoCodeDto } from './createPromoCode.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePromoCodeDto extends PartialType(CreatePromoCodeDto) {}
