import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Food',
    description: 'Category name',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Hex color code for category',
  })
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, {
    message: 'Color must be a valid hex code',
  })
  color!: string;
}