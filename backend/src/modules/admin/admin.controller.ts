import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard admin' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del sistema',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            total_revenue: { type: 'number', example: 15420.50 },
            total_users: { type: 'number', example: 342 },
            active_products: { type: 'number', example: 12 },
            purchases_today: { type: 'object', properties: { count: { type: 'number' }, revenue: { type: 'number' } } },
            purchases_week: { type: 'object', properties: { count: { type: 'number' }, revenue: { type: 'number' } } },
            purchases_month: { type: 'object', properties: { count: { type: 'number' }, revenue: { type: 'number' } } },
          },
        },
        sales_chart: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: { type: 'string', example: '2024-01-15' },
              revenue: { type: 'number', example: 250.00 },
              count: { type: 'number', example: 3 },
            },
          },
        },
        recent_purchases: { type: 'array' },
        recent_users: { type: 'array' },
      },
    },
  })
  async getStats() {
    return this.adminService.getStats();
  }
}
