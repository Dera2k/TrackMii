// src/modules/users/dtos/update-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
  })
  @IsString()
  current_password!: string;

  @ApiProperty({
    example: 'newPassword123',
  })
  @IsString()
  @MinLength(8)
  new_password!: string;
}