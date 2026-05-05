import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'pauldennis@anything.com',
    description: 'User email address used for login',
  })
  @IsEmail()
  email!: string;



  @ApiProperty({
    example: 'strongPassword123',
    description: 'User password for login',
  })
  @IsString()
  password!: string;
}