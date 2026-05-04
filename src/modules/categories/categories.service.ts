import { Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { UpdateCategoryDto } from "./dtos/update-category.dto";
import { CategoryResponseDto } from "./dtos/category-response.dto";

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoryRepo: Repository<Category>,
    ) {}

    async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = this.categoryRepo.create({
      user_id: userId,
      name: dto.name,
      color: dto.color,
      is_default: false,
    });

    await this.categoryRepo.save(category);

    return this.toResponseDto(category);
  }

  async findAll(userId: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepo.find({
      where: [
        { user_id: userId },
        { user_id: IsNull() }, // System defaults
      ],
      order: { is_default: 'DESC', name: 'ASC' },
    });

    return categories.map((c) => this.toResponseDto(c));
  }

  async findOne(userId: string, id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({
      where: [
        { id, user_id: userId },
        { id, user_id: IsNull() },
      ],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.toResponseDto(category);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id: userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.is_default) {
      throw new ForbiddenException('Cannot update system default category');
    }

    if (dto.name !== undefined) {
      category.name = dto.name;
    }

    if (dto.color !== undefined) {
      category.color = dto.color;
    }

    await this.categoryRepo.save(category);

    return this.toResponseDto(category);
  }

  async delete(userId: string, id: string): Promise<void> {
    const category = await this.categoryRepo.findOne({
      where: { id, user_id: userId },
      relations: ['expenses'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.is_default) {
      throw new ForbiddenException('Cannot delete system default category');
    }

    const hasExpenses = await this.checkHasExpenses(id);
    if (hasExpenses) {
      throw new ConflictException(
        'Cannot delete category with existing expenses. Reassign expenses first.',
      );
    }

    await this.categoryRepo.remove(category);
  }

  async checkHasExpenses(categoryId: string): Promise<boolean> {
    const count = await this.categoryRepo
      .createQueryBuilder('category')
      .leftJoin('category.expenses', 'expense')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('expense.is_deleted = :isDeleted', { isDeleted: false })
      .getCount();

    return count > 0;
  }

  async seedDefaults(): Promise<void> {
    const defaults = [
      { name: 'Food & Dining', color: '#FF5733' },
      { name: 'Transportation', color: '#33C3FF' },
      { name: 'Shopping', color: '#FF33A8' },
      { name: 'Entertainment', color: '#8E44AD' },
      { name: 'Bills & Utilities', color: '#F39C12' },
      { name: 'Healthcare', color: '#E74C3C' },
      { name: 'Education', color: '#3498DB' },
      { name: 'Travel', color: '#1ABC9C' },
      { name: 'Other', color: '#95A5A6' },
    ];

    for (const def of defaults) {
      const exists = await this.categoryRepo.findOne({
        where: { name: def.name, is_default: true },
      });

      if (!exists) {
        const category = this.categoryRepo.create({
          user_id: null,
          name: def.name,
          color: def.color,
          is_default: true,
        });
        await this.categoryRepo.save(category);
      }
    }
  }

  toResponseDto(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      is_default: category.is_default,
      created_at: category.created_at,
    };
  }
}