import { Controller, Get, Post, Param, Query, Res, UseGuards, ParseIntPipe, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { PurchasesService, CreateCheckoutDto } from './purchases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PaymentStatus, PurchaseType } from './entities/purchase.entity';

@ApiTags('Admin - Purchases')
@Controller('admin/purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Get('stats')
  @ApiOperation({ summary: '[ADMIN] Estadísticas de compras' })
  async getStats() {
    return this.purchasesService.getStats();
  }

  @Get('export')
  @ApiOperation({ summary: '[ADMIN] Exportar compras a CSV' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'type', required: false, enum: PurchaseType })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async exportCsv(
    @Res() res: Response,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: PurchaseType,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const purchases = await this.purchasesService.findAllForExport({ status, type, search, dateFrom, dateTo });

    const headers = ['ID', 'Usuario', 'Email', 'Tipo', 'Item', 'Precio Original', 'Precio Pagado', 'Descuento', 'Cupón', 'Método', 'Estado', 'Transacción', 'Fecha'];
    const rows = purchases.map(p => [
      p.id,
      p.user?.username || 'N/A',
      p.user?.email || 'N/A',
      p.purchase_type,
      p.product?.name || p.plan?.name || 'N/A',
      p.original_price,
      p.price_paid,
      p.discount_amount,
      p.coupon_code || '',
      p.payment_method,
      p.payment_status,
      p.transaction_id || '',
      new Date(p.created_at).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=compras_${new Date().toISOString().split('T')[0]}.csv`);
    res.send('\uFEFF' + csv);
  }

  @Get()
  @ApiOperation({ summary: '[ADMIN] Listar todas las compras' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'type', required: false, enum: PurchaseType })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
    @Query('type') type?: PurchaseType,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.purchasesService.findAll({ page, limit, status, type, search, dateFrom, dateTo });
  }

  @Get(':id')
  @ApiOperation({ summary: '[ADMIN] Obtener compra por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findById(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: '[ADMIN] Reembolsar compra' })
  async refund(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.refund(id);
  }
}

@ApiTags('Checkout')
@Controller('checkout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class CheckoutController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden de compra' })
  async createOrder(
    @CurrentUser() user: any,
    @Body() dto: CreateCheckoutDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const purchases = await this.purchasesService.createCheckout(user.id, dto, ipAddress);

    return {
      success: true,
      transaction_id: purchases[0]?.transaction_id,
      purchases: purchases.map(p => ({
        id: p.id,
        product_id: p.product_id,
        original_price: p.original_price,
        price_paid: p.price_paid,
        payment_status: p.payment_status,
      })),
      message: dto.payment_method === 'discord'
        ? 'Orden creada. Por favor contacta al soporte en Discord para completar el pago.'
        : 'Orden creada. Redirigiendo a PayPal...',
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Mi historial de compras' })
  async myHistory(@CurrentUser() user: any) {
    return this.purchasesService.findByUser(user.id);
  }

  @Get('order/:transactionId')
  @ApiOperation({ summary: 'Obtener detalles de una orden' })
  async getOrder(@Param('transactionId') transactionId: string, @CurrentUser() user: any) {
    const purchases = await this.purchasesService.findByTransactionId(transactionId);
    // Verify ownership
    if (purchases.length === 0 || purchases[0].user_id !== user.id) {
      return { success: false, message: 'Orden no encontrada' };
    }
    return { success: true, purchases };
  }

  @Post('claim-free')
  @ApiOperation({ summary: 'Reclamar producto gratuito' })
  async claimFreeProduct(
    @CurrentUser() user: any,
    @Body('productId') productId: number,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const purchase = await this.purchasesService.claimFreeProduct(user.id, productId, ipAddress);
    return { success: true, purchase, message: 'Producto agregado a tu cuenta' };
  }
}
