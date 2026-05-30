import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CouponsService, CreateCouponDto } from './coupons.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

// Public controller for coupon validation
@ApiTags('Coupons')
@Controller('coupons')
@Public()
export class PublicCouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Obtener cupones disponibles' })
  async getAvailable() {
    const coupons = await this.couponsService.getAvailableCoupons();
    // Return only public info (no internal details)
    return coupons.map(c => ({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      min_purchase: Number(c.min_purchase),
      end_date: c.end_date,
    }));
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validar código de cupón' })
  @ApiQuery({ name: 'code', type: String })
  @ApiQuery({ name: 'subtotal', type: Number })
  async validate(@Query('code') code: string, @Query('subtotal') subtotal: string) {
    const price = parseFloat(subtotal) || 0;
    const coupon = await this.couponsService.validate(code, price);
    const discount = this.couponsService.calculateDiscount(coupon, price);
    return {
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      discount_amount: discount,
      final_price: price - discount,
    };
  }
}

@ApiTags('Admin - Coupons')
@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get() @ApiOperation({ summary: '[ADMIN] Listar cupones' })
  async findAll() { return this.couponsService.findAll(); }

  @Post() @ApiOperation({ summary: '[ADMIN] Crear cupón' })
  async create(@Body() dto: CreateCouponDto) { return this.couponsService.create(dto); }

  @Patch(':id') @ApiOperation({ summary: '[ADMIN] Actualizar cupón' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateCouponDto>) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: '[ADMIN] Eliminar cupón' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.couponsService.delete(id);
    return { message: 'Coupon deleted' };
  }

  @Get(':id') @ApiOperation({ summary: '[ADMIN] Obtener cupón por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(id);
  }

  @Get(':id/usages') @ApiOperation({ summary: '[ADMIN] Obtener usos de un cupón' })
  async getUsages(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.getUsages(id);
  }

  @Patch(':id/status') @ApiOperation({ summary: '[ADMIN] Activar/desactivar cupón' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.toggleStatus(id);
  }
}
