import { Controller, Post, Body, Get, Param, Req, HttpCode, HttpStatus, Headers, RawBodyRequest, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, CreateOrderResponseDto } from './dto/create-order.dto';
import { CaptureOrderDto, CaptureOrderResponseDto } from './dto/capture-order.dto';
import { PayPalWebhookEventDto } from './dto/webhook.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create PayPal order for checkout' })
  @ApiResponse({ status: 201, description: 'Order created', type: CreateOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async createOrder(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    return this.paymentsService.createOrder(user, dto);
  }

  @Post('capture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture PayPal payment after user approval' })
  @ApiResponse({ status: 200, description: 'Payment captured', type: CaptureOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Payment failed or order not found' })
  async captureOrder(
    @CurrentUser() user: User,
    @Body() dto: CaptureOrderDto,
    @Req() req: Request,
  ): Promise<CaptureOrderResponseDto> {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    return this.paymentsService.captureOrder(user, dto.order_id, ipAddress);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get PayPal order details' })
  @ApiResponse({ status: 200, description: 'Order details' })
  async getOrderDetails(@Param('orderId') orderId: string): Promise<any> {
    return this.paymentsService.getOrderDetails(orderId);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Headers() headers: Record<string, string>,
    @Body() event: PayPalWebhookEventDto,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ received: boolean }> {
    // Verify webhook signature in production
    const rawBody = req.rawBody?.toString() || JSON.stringify(event);
    const isValid = await this.paymentsService.verifyWebhookSignature(headers, rawBody);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    return this.paymentsService.handleWebhook(event);
  }
}
