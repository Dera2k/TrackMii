import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Currency } from '../../../common/enums/currency.enum';

export class UpdatePreferencesDto {
  @ApiProperty({
    required: false,
    example: 'NGN',
    enum: Currency,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    required: false,
    example: 'Africa/Lagos',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  dark_mode?: boolean;
}