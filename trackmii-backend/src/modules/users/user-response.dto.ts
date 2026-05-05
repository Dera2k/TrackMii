import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../common/enums/currency.enum';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  currency!: Currency;

  @ApiProperty()
  timezone!: string;

  @ApiProperty()
  dark_mode!: boolean;

  @ApiProperty()
  is_email_verified!: boolean;

  @ApiProperty()
  created_at!: Date;
}