import { AnalyticsService } from "./analytics.service";
import { AnalyticsQueryDto } from "./dtos/analytics-query.dto";
import { DashboardStatsDto } from "./dtos/dashboard-stats.dto";
import { MonthlyAnalyticsDto } from "./dtos/monthly-analytics.dto";
import { WeeklyAnalyticsDto } from "./dtos/weekly-analytics.dto";
import { CategoryBreakdownDto } from "./dtos/category-breakdown.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags,ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard stats retrieved',
    type: DashboardStatsDto,
  })
  async getDashboardStats(
    @CurrentUser() user: any,
  ): Promise<DashboardStatsDto> {
    return this.analyticsService.getDashboardStats(user.id);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly spending trends' })
  @ApiResponse({
    status: 200,
    description: 'Monthly analytics retrieved',
    type: MonthlyAnalyticsDto,
  })
  async getMonthlyTrends(
    @CurrentUser() user: any,
    @Query() query: AnalyticsQueryDto,
  ): Promise<MonthlyAnalyticsDto> {
    const months = query.months || 6;
    return this.analyticsService.getMonthlyTrends(user.id, months);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly spending trends' })
  @ApiResponse({
    status: 200,
    description: 'Weekly analytics retrieved',
    type: WeeklyAnalyticsDto,
  })
  async getWeeklyTrends(
    @CurrentUser() user: any,
    @Query() query: AnalyticsQueryDto,
  ): Promise<WeeklyAnalyticsDto> {
    const weeks = query.weeks || 8;
    return this.analyticsService.getWeeklyTrends(user.id, weeks);
  }

  @Get('category-breakdown')
  @ApiOperation({ summary: 'Get spending breakdown by category' })
  @ApiResponse({
    status: 200,
    description: 'Category breakdown retrieved',
    type: CategoryBreakdownDto,
  })
  async getCategoryBreakdown(
    @CurrentUser() user: any,
    @Query() query: AnalyticsQueryDto,
  ): Promise<CategoryBreakdownDto> {
    return this.analyticsService.getCategoryBreakdown(
      user.id,
      query.start_date,
      query.end_date,
    );
  }
}