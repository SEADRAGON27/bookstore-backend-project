import { PartialType } from '@nestjs/mapped-types';
import { BookDto } from './book.dto';

export class UpdateBookDto extends PartialType(BookDto) {}
