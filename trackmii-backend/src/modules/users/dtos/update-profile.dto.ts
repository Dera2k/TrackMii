import { PartialType, OmitType } from '@nestjs/swagger';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';

export class UpdateProfileDto extends PartialType(
  OmitType(RegisterDto, ['password'] as const),
) {}