import { ApiProperty } from '@nestjs/swagger';
import { Currency } from 'src/common/enums/currency.enum';

export class UpdatePreferencesDto {
  @ApiProperty({
    required: false,
    example: 'NGN',
  })
  currency?: Currency;

  @ApiProperty({
    required: false,
    example: 'Africa/Lagos',
  })
  timezone?: string;

  @ApiProperty({
    required: false,
    example: false,
  })
  dark_mode?: boolean;
}