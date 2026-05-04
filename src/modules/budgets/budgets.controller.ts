import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { BudgetsService } from "./budgets.service";
import { CreateBudgetDto } from "./dtos/create-budget.dto";
import { UpdateBudgetDto } from "./dtos/update-budget.dto";
import { BudgetQueryDto } from "./dtos/budget-query.dto";
import { BudgetResponseDto } from "./dtos/budget-response.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create budget' })
  @ApiResponse({
    status: 201,
    description: 'Budget created',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot set budget for past month',
  })
  @ApiResponse({
    status: 409,
    description: 'Budget already exists for this category/month/year',
  })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateBudgetDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets with filters' })
  @ApiResponse({
    status: 200,
    description: 'Budgets retrieved',
    type: [BudgetResponseDto],
  })
  async findAll(
    @CurrentUser() user: any,
    @Query() query: BudgetQueryDto,
  ): Promise<BudgetResponseDto[]> {
    return this.budgetsService.findAll(user.id, query);
  }

  @Get('current-month')
  @ApiOperation({ summary: 'Get current month budgets' })
  @ApiResponse({
    status: 200,
    description: 'Current month budgets retrieved',
    type: [BudgetResponseDto],
  })
  async getCurrentMonth(
    @CurrentUser() user: any,
  ): Promise<BudgetResponseDto[]> {
    return this.budgetsService.findCurrentMonth(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by ID' })
  @ApiParam({ name: 'id', description: 'Budget UUID' })
  @ApiResponse({
    status: 200,
    description: 'Budget retrieved',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BudgetResponseDto> {
    return this.budgetsService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update budget' })
  @ApiParam({ name: 'id', description: 'Budget UUID' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated',
    type: BudgetResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<BudgetResponseDto> {
    return this.budgetsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete budget' })
  @ApiParam({ name: 'id', description: 'Budget UUID' })
  @ApiResponse({
    status: 200,
    description: 'Budget deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Budget not found',
  })
  async delete(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.budgetsService.delete(user.id, id);
    return { message: 'Budget deleted successfully' };
  }
}