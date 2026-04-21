import { PartialType } from '@nestjs/swagger';
import { ExpenseQueryDto } from 'src/modules/expenses/dtos/expense-query.dto';

export class ExportQueryDto extends PartialType(ExpenseQueryDto) {}