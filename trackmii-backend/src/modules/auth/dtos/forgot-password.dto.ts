import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'pauldennis@anything.com',
    description: 'Email address to receive password reset link',
  })
  @IsEmail()
  email!: string;
}