// src/modules/categories/categories.controller.ts

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseUUIDPipe,} from '@nestjs/common';

import {ApiTags,  ApiOperation, ApiResponse, ApiBearerAuth, ApiParam,} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { CategoryResponseDto } from './dtos/category-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create custom category' })
  @ApiResponse({
    status: 201,
    description: 'Category created',
    type: CategoryResponseDto,
  })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories (system + custom)' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved',
    type: [CategoryResponseDto],
  })
  async findAll(@CurrentUser() user: any): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update custom category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot update system default category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete custom category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot delete system default category',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category has existing expenses',
  })
  async delete(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.delete(user.id, id);
    return { message: 'Category deleted successfully' };
  }
}