import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  CheckoutPaymentIntent,
  OrderRequest,
  OrderApplicationContextLandingPage,
  OrderApplicationContextUserAction,
  Order,
} from '@paypal/paypal-server-sdk';
import { PayPalConfig } from './paypal.config';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayPalWebhookEventDto } from './dto/webhook.dto';
import { Purchase, PurchaseType, PaymentStatus } from '../purchases/entities/purchase.entity';
import { LicensesService } from '../licenses/licenses.service';
import { CouponsService } from '../coupons/coupons.service';
import { PlansService } from '../plans/plans.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/entities/user.entity';

interface OrderMetadata {
  user_id: number;
  items: Array<{ product_id: number; name: string; price: number; quantity: number }>;
  plan?: { plan_id: number; name: string; price: number };
  coupon_code?: string;
  discount_amount: number;
  paypal_fee: number;
  original_total: number;
  final_total: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private orderMetadataCache = new Map<string, OrderMetadata>();

  constructor(
    private paypalConfig: PayPalConfig,
    private licensesService: LicensesService,
    private couponsService: CouponsService,
    private plansService: PlansService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
  ) {}

  async createOrder(user: User, dto: CreateOrderDto): Promise<{ order_id: string; status: string; approval_url: string }> {
    if (!dto.items?.length && !dto.plan) {
      throw new BadRequestException('Must provide items or a plan to purchase');
    }

    let originalTotal = 0;
    let discountAmount = 0;
    const itemsForPayPal: any[] = [];

    // Calculate products total
    if (dto.items?.length) {
      for (const item of dto.items) {
        const itemTotal = item.price * item.quantity;
        originalTotal += itemTotal;
        itemsForPayPal.push({
          name: item.name,
          quantity: String(item.quantity),
          unitAmount: { currencyCode: 'USD', value: item.price.toFixed(2) },
        });
      }
    }

    // Calculate plan total
    if (dto.plan) {
      originalTotal += dto.plan.price;
      itemsForPayPal.push({
        name: dto.plan.name,
        quantity: '1',
        unitAmount: { currencyCode: 'USD', value: dto.plan.price.toFixed(2) },
      });
    }

    // Apply coupon if provided
    if (dto.coupon_code) {
      try {
        const coupon = await this.couponsService.validate(dto.coupon_code, originalTotal);
        discountAmount = this.couponsService.calculateDiscount(coupon, originalTotal);
      } catch {
        // Coupon invalid, continue without discount
      }
    }

    const subtotalAfterDiscount = Math.max(0, originalTotal - discountAmount);

    if (subtotalAfterDiscount <= 0) {
      throw new BadRequestException('Order total must be greater than 0');
    }

    // Calculate PayPal fee: 5.4% + $0.30 (LATAM)
    const paypalFee = (subtotalAfterDiscount * 0.054) + 0.30;
    const finalTotal = subtotalAfterDiscount + paypalFee;

    // Create PayPal order
    const orderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: 'USD',
            value: finalTotal.toFixed(2),
            breakdown: {
              itemTotal: { currencyCode: 'USD', value: originalTotal.toFixed(2) },
              discount: { currencyCode: 'USD', value: discountAmount.toFixed(2) },
              handling: { currencyCode: 'USD', value: paypalFee.toFixed(2) },
            },
          },
          items: itemsForPayPal,
        },
      ],
      applicationContext: {
        brandName: 'DisenosElite',
        landingPage: OrderApplicationContextLandingPage.Login,
        userAction: OrderApplicationContextUserAction.PayNow,
        returnUrl: `${process.env.APP_URL}/checkout/success`,
        cancelUrl: `${process.env.APP_URL}/checkout/cancel`,
      },
    };

    try {
      const response = await this.paypalConfig.orders.createOrder({ body: orderRequest });
      console.log('PayPal createOrder response:', JSON.stringify(response, null, 2));

      // El SDK puede devolver 'result' o 'body' dependiendo de la versión
      const order = (response.result || response.body) as Order;
      console.log('Parsed order:', JSON.stringify(order, null, 2));

      const orderId = order.id;
      const approvalUrl = order.links?.find((link) => link.rel === 'approve')?.href;

      // Store metadata for capture
      this.orderMetadataCache.set(orderId, {
        user_id: user.id,
        items: dto.items || [],
        plan: dto.plan,
        coupon_code: dto.coupon_code,
        discount_amount: discountAmount,
        paypal_fee: paypalFee,
        original_total: originalTotal,
        final_total: finalTotal,
      });

      return {
        order_id: orderId,
        status: order.status,
        approval_url: approvalUrl,
      };
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw new InternalServerErrorException('Failed to create PayPal order');
    }
  }

  async captureOrder(user: User, orderId: string, ipAddress?: string): Promise<any> {
    const metadata = this.orderMetadataCache.get(orderId);
    if (!metadata) {
      throw new BadRequestException('Order not found or expired');
    }

    if (metadata.user_id !== user.id) {
      throw new BadRequestException('Order does not belong to this user');
    }

    try {
      const response = await this.paypalConfig.orders.captureOrder({ id: orderId });
      const order = response.body as Order;

      if (order.status !== 'COMPLETED') {
        throw new BadRequestException('Payment was not completed');
      }

      const captureId = order.purchaseUnits?.[0]?.payments?.captures?.[0]?.id;
      const purchases: Purchase[] = [];

      // Create purchase records and add to license
      if (metadata.items?.length) {
        for (const item of metadata.items) {
          const purchase = this.purchaseRepo.create({
            user_id: user.id,
            purchase_type: PurchaseType.PRODUCT,
            product_id: item.product_id,
            quantity: item.quantity,
            original_price: item.price * item.quantity,
            price_paid: item.price * item.quantity - (metadata.discount_amount / metadata.items.length),
            coupon_code: metadata.coupon_code,
            discount_amount: metadata.discount_amount / metadata.items.length,
            payment_method: 'paypal',
            payment_status: PaymentStatus.COMPLETED,
            transaction_id: captureId,
            payment_details: { paypal_order_id: orderId, capture_id: captureId },
            ip_address: ipAddress,
            completed_at: new Date(),
          });
          const savedPurchase = await this.purchaseRepo.save(purchase);
          purchases.push(savedPurchase);

          // Add product to user's license (permanent access)
          await this.licensesService.addProduct(user.id, item.product_id, null, 'purchase');
        }
      }

      // Handle plan purchase
      if (metadata.plan) {
        const purchase = this.purchaseRepo.create({
          user_id: user.id,
          purchase_type: PurchaseType.PLAN,
          plan_id: metadata.plan.plan_id,
          quantity: 1,
          original_price: metadata.plan.price,
          price_paid: metadata.plan.price - metadata.discount_amount,
          coupon_code: metadata.coupon_code,
          discount_amount: metadata.discount_amount,
          payment_method: 'paypal',
          payment_status: PaymentStatus.COMPLETED,
          transaction_id: captureId,
          payment_details: { paypal_order_id: orderId, capture_id: captureId },
          ip_address: ipAddress,
          completed_at: new Date(),
        });
        const savedPurchase = await this.purchaseRepo.save(purchase);
        purchases.push(savedPurchase);

        // Assign plan to user
        await this.plansService.assignPlan(user.id, metadata.plan.plan_id, 'purchase');
      }

      // Mark coupon as used
      if (metadata.coupon_code && purchases.length > 0) {
        try {
          await this.couponsService.recordUsage(
            metadata.coupon_code,
            user.id,
            purchases[0].id,
            metadata.discount_amount,
            {
              username: user.username,
              avatar: user.avatar,
              originalTotal: metadata.original_total,
            },
          );
        } catch {
          // Continue even if coupon recording fails
        }
      }

      // Clean up metadata
      this.orderMetadataCache.delete(orderId);

      // Send Discord notification
      await this.notificationsService.sendPurchaseNotification({
        username: user.username,
        discordId: user.discord_id,
        avatar: user.avatar,
        items: metadata.items || [],
        plan: metadata.plan,
        total: metadata.final_total,
        discount: metadata.discount_amount,
        couponCode: metadata.coupon_code,
        transactionId: captureId,
      });

      return {
        success: true,
        transaction_id: captureId,
        purchase_ids: purchases.map((p) => p.id),
        status: 'COMPLETED',
        message: 'Payment completed successfully',
      };
    } catch (error) {
      console.error('PayPal capture error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to capture PayPal payment');
    }
  }

  async getOrderDetails(orderId: string): Promise<Order> {
    try {
      const response = await this.paypalConfig.orders.getOrder({ id: orderId });
      return response.body as Order;
    } catch (error) {
      console.error('PayPal get order error:', error);
      throw new InternalServerErrorException('Failed to get order details');
    }
  }

  async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string,
  ): Promise<boolean> {
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
    if (!webhookId) {
      this.logger.warn('PAYPAL_WEBHOOK_ID not configured, skipping verification');
      return true;
    }

    try {
      const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
      const clientSecret = this.configService.get<string>('PAYPAL_SECRET');
      const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
      const baseUrl = isProduction
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

      // Get access token
      const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });
      const authData = await authResponse.json();

      // Verify webhook signature
      const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.access_token}`,
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: JSON.parse(body),
        }),
      });

      const verifyData = await verifyResponse.json();
      return verifyData.verification_status === 'SUCCESS';
    } catch (error) {
      this.logger.error('Webhook verification failed:', error);
      return false;
    }
  }

  async handleWebhook(event: PayPalWebhookEventDto): Promise<{ received: boolean }> {
    this.logger.log(`Received webhook event: ${event.event_type}`);

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await this.handlePaymentCaptureCompleted(event);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await this.handlePaymentRefunded(event);
        break;
      case 'PAYMENT.CAPTURE.REVERSED':
        await this.handlePaymentReversed(event);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await this.handlePaymentDenied(event);
        break;
      default:
        this.logger.log(`Unhandled webhook event type: ${event.event_type}`);
    }

    return { received: true };
  }

  private async handlePaymentCaptureCompleted(event: PayPalWebhookEventDto): Promise<void> {
    const captureId = event.resource?.id;
    if (!captureId) return;

    // Find purchase by transaction ID and confirm it's completed
    const purchase = await this.purchaseRepo.findOne({ where: { transaction_id: captureId } });
    if (purchase && purchase.payment_status !== PaymentStatus.COMPLETED) {
      purchase.payment_status = PaymentStatus.COMPLETED;
      purchase.completed_at = new Date();
      await this.purchaseRepo.save(purchase);
      this.logger.log(`Payment confirmed via webhook: ${captureId}`);
    }
  }

  private async handlePaymentRefunded(event: PayPalWebhookEventDto): Promise<void> {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    const captureId = event.resource?.id;

    if (!orderId && !captureId) return;

    // Find purchase and mark as refunded
    const purchase = await this.purchaseRepo.findOne({
      where: captureId ? { transaction_id: captureId } : undefined,
      relations: ['user'],
    });

    if (purchase) {
      purchase.payment_status = PaymentStatus.REFUNDED;
      await this.purchaseRepo.save(purchase);
      this.logger.log(`Payment refunded via webhook: ${captureId || orderId}`);

      // Send refund notification
      await this.notificationsService.sendRefundNotification(
        purchase.user?.username || 'Unknown',
        captureId || orderId,
        Number(purchase.price_paid) || 0,
      );

      // Optionally remove product from license
      if (purchase.product_id) {
        try {
          await this.licensesService.removeProduct(purchase.user_id, purchase.product_id);
        } catch (error) {
          this.logger.error('Failed to remove product after refund:', error);
        }
      }
    }
  }

  private async handlePaymentReversed(event: PayPalWebhookEventDto): Promise<void> {
    // Handle chargebacks/reversals
    const captureId = event.resource?.id;
    if (!captureId) return;

    const purchase = await this.purchaseRepo.findOne({ where: { transaction_id: captureId } });
    if (purchase) {
      purchase.payment_status = PaymentStatus.FAILED;
      await this.purchaseRepo.save(purchase);
      this.logger.warn(`Payment reversed (chargeback): ${captureId}`);

      // Remove product from license
      if (purchase.product_id) {
        try {
          await this.licensesService.removeProduct(purchase.user_id, purchase.product_id);
        } catch (error) {
          this.logger.error('Failed to remove product after reversal:', error);
        }
      }
    }
  }

  private async handlePaymentDenied(event: PayPalWebhookEventDto): Promise<void> {
    const captureId = event.resource?.id;
    if (!captureId) return;

    const purchase = await this.purchaseRepo.findOne({ where: { transaction_id: captureId } });
    if (purchase) {
      purchase.payment_status = PaymentStatus.FAILED;
      await this.purchaseRepo.save(purchase);
      this.logger.warn(`Payment denied: ${captureId}`);
    }
  }
}
