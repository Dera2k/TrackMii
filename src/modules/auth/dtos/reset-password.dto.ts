import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'reset-token-abc123',
    description: 'Password reset token sent to user email',
  })
  @IsString()
  token!: string;


  
  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'New password (minimum 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  new_password!: string;
}