import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min, Max, IsPositive, IsIP } from 'class-validator';
import { LicensesService } from './licenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LicenseStatus } from './entities/license.entity';
import { UserRole } from '../users/entities/user.entity';

class AddProductDto {
  @IsNumber() @IsPositive() product_id: number;
  @IsOptional() @IsNumber() @Min(1) @Max(365) days?: number;
}
class ChangeStatusDto {
  @IsEnum(LicenseStatus) status: LicenseStatus;
  @IsOptional() @IsString() reason?: string;
}
class UpdateNetworkDto {
  @IsIP() authorized_ip: string;
  @IsNumber() @Min(1) @Max(65535) authorized_port: number;
}

@ApiTags('Admin - Licenses')
@Controller('admin/licenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class LicensesController {
  constructor(private licensesService: LicensesService) {}

  @Get() @ApiOperation({ summary: '[ADMIN] Listar licencias' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: LicenseStatus })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: LicenseStatus) {
    return this.licensesService.findAll({ page, limit, status });
  }

  @Get(':id') @ApiOperation({ summary: '[ADMIN] Obtener licencia por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.licensesService.findById(id); }

  @Post(':userId/add-product') @ApiOperation({ summary: '[ADMIN] Agregar producto a licencia' })
  async addProduct(@Param('userId', ParseIntPipe) userId: number, @Body() dto: AddProductDto, @CurrentUser() admin: any) {
    return this.licensesService.addProduct(userId, dto.product_id, dto.days, `admin:${admin.discord_id}`);
  }

  @Delete(':userId/remove-product/:productId') @ApiOperation({ summary: '[ADMIN] Remover producto de licencia' })
  async removeProduct(@Param('userId', ParseIntPipe) userId: number, @Param('productId', ParseIntPipe) productId: number) {
    return this.licensesService.removeProduct(userId, productId);
  }

  @Patch(':userId/status') @ApiOperation({ summary: '[ADMIN] Cambiar estado de licencia' })
  async changeStatus(@Param('userId', ParseIntPipe) userId: number, @Body() dto: ChangeStatusDto, @CurrentUser() admin: any) {
    return this.licensesService.changeStatus(userId, dto.status, dto.reason, admin.id);
  }

  @Patch(':userId/network') @ApiOperation({ summary: '[ADMIN] Actualizar IP y puerto autorizado' })
  async updateNetwork(@Param('userId', ParseIntPipe) userId: number, @Body() dto: UpdateNetworkDto) {
    return this.licensesService.updateNetworkConfig(userId, dto.authorized_ip, dto.authorized_port);
  }

  @Get(':userId/history') @ApiOperation({ summary: '[ADMIN] Historial de cambios de estado' })
  async getHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.licensesService.getStatusHistory(userId);
  }
}
