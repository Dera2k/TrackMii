import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';

export class UpdateBudgetDto extends PartialType(
  OmitType(CreateBudgetDto, ['month', 'year', 'category_id'] as const),
) {}

// deesigned to ignore, categoryid, month and year