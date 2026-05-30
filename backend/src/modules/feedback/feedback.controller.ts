import { Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FeedbackService, CreateFeedbackDto } from './feedback.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Public() @Get() @ApiOperation({ summary: 'Listar feedback visible' })
  async findPublic() { return this.feedbackService.findPublic(); }

  @Post() @ApiBearerAuth('JWT') @ApiOperation({ summary: 'Crear feedback' })
  async create(@Body() dto: CreateFeedbackDto, @CurrentUser() user: any) {
    return this.feedbackService.create(user.id, dto);
  }

  @Delete(':id') @ApiBearerAuth('JWT') @ApiOperation({ summary: 'Eliminar mi feedback' })
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    await this.feedbackService.delete(id, user.id);
    return { message: 'Feedback deleted' };
  }
}

@ApiTags('Admin - Feedback')
@Controller('admin/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class FeedbackAdminController {
  constructor(private feedbackService: FeedbackService) {}

  @Get('stats')
  @ApiOperation({ summary: '[ADMIN] Estadísticas de feedback' })
  async getStats() {
    return this.feedbackService.getStats();
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] Listar todo el feedback' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('visibility') visibility?: string,
    @Query('featured') featured?: string,
  ) {
    return this.feedbackService.findAll({ page, limit, search, visibility, featured });
  }

  @Patch(':id/visibility')
  @ApiOperation({ summary: '[ADMIN] Toggle visibilidad' })
  async toggleVisibility(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.toggleVisibility(id);
  }

  @Patch(':id/featured')
  @ApiOperation({ summary: '[ADMIN] Toggle destacado' })
  async toggleFeatured(@Param('id', ParseIntPipe) id: number) {
    return this.feedbackService.toggleFeatured(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[ADMIN] Eliminar feedback' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.feedbackService.adminDelete(id);
    return { message: 'Feedback deleted' };
  }
}
