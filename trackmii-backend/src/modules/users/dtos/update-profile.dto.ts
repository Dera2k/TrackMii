import { PartialType, OmitType } from '@nestjs/swagger';
import { RegisterDto } from '../../auth/dtos/register.dto';

export class UpdateProfileDto extends PartialType(
  OmitType(RegisterDto, ['password'] as const),
) {}