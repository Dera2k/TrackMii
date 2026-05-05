import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '../../common/enums/currency.enum';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authentication',
  })
  access_token!: string;

  @ApiProperty({
    description: 'Authenticated user information',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Paul Dennis',
      email: 'pauldennis@anything.com',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      dark_mode: false,
    },
  })
  user!: {
    id: string;
    name: string;
    email: string;
    currency: Currency;
    timezone: string;
    dark_mode: boolean;
  };
}