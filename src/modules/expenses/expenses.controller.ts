import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dtos/create-expense.dto";
import { UpdateExpenseDto } from "./dtos/update-expense.dto";
import { ExpenseQueryDto } from "./dtos/expense-query.dto";
import { BulkDeleteDto } from "./dtos/bulk-delete.dto";
import { ExpenseResponseDto } from "./dtos/expense-response.dto";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { CurrentUser } from "src/common/decorators/current-user.decorator";

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense' })
  @ApiResponse({
    status: 201,
    description: 'Expense created',
    type: ExpenseResponseDto,
  })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Expenses retrieved',
  })
  async findAll(@CurrentUser() user: any, @Query() query: ExpenseQueryDto) {
    return this.expensesService.findAllPaginated(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  async findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense updated',
    type: ExpenseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.update(user.id, id, dto);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete expenses' })
  @ApiResponse({
    status: 200,
    description: 'Expenses deleted',
  })
  async bulkDelete(
    @CurrentUser() user: any,
    @Body() dto: BulkDeleteDto,
  ): Promise<{ message: string; deleted_count: number }> {
    const count = await this.expensesService.bulkDelete(user.id, dto);
    return { message: 'Expenses deleted successfully', deleted_count: count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete single expense' })
  @ApiParam({ name: 'id', description: 'Expense UUID' })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found',
  })
  async delete(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.expensesService.delete(user.id, id);
    return { message: 'Expense deleted successfully' };
  }
}