import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Paul Dennis',
    description: 'Full name of the user',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string;



  @ApiProperty({
    example: 'pauldennis@anything.com',
    description: 'User email address',
  })
  @IsEmail()
  email!: string;




  @ApiProperty({
    example: 'StrongPassword@123',
    description: 'User password (min 8 characters)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}