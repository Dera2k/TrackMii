import { PartialType } from '@nestjs/swagger';
import { ExpenseQueryDto } from '../../expenses/dtos/expense-query.dto';

export class ExportQueryDto extends PartialType(ExpenseQueryDto) {}