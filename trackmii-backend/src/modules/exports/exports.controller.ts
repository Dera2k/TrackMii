import { Controller, Get, Query,UseGuards, Res, StreamableFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { ExportQueryDto } from './dtos/export-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportsService) {}

  @Get('xlsx')
  @ApiOperation({ summary: 'Export expenses to XLSX' })
  @ApiResponse({
    status: 200,
    description: 'XLSX file generated',
  })
  async exportToXlsx(
    @CurrentUser() user: any,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const xlsxBuffer = await this.exportService.exportToXlsx(user.id, query);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="expenses-${Date.now()}.xlsx"`,
    });

    return new StreamableFile(xlsxBuffer);
  }
}