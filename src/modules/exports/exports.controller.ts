// src/modules/export/export.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportsService } from './exports.service';
import { ExportQueryDto } from './dtos/export-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';



@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportsService) {}

  @Get('csv')
  @ApiOperation({ summary: 'Export expenses to CSV' })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated',
  })
  async exportToCsv(
    @CurrentUser() user: any,
    @Query() query: ExportQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const csvBuffer = await this.exportService.exportToCsv(user.id, query);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="expenses-${Date.now()}.csv"`,
    });

    return new StreamableFile(csvBuffer);
  }
}