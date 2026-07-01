import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike, In } from 'typeorm';
import { Purchase, PaymentStatus, PurchaseType } from './entities/purchase.entity';
import { Product } from '../products/entities/product.entity';
import { IsArray, IsString, IsOptional, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LicensesService } from '../licenses/licenses.service';

class CartItemDto {
  @ApiProperty() @IsNumber() id: number;
  @ApiProperty() @IsNumber() price: number;
}

export class CreateCheckoutDto {
  @ApiProperty({ type: [CartItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiProperty() @IsString() payment_method: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() coupon_code?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() discount_amount?: number;
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  type?: PurchaseType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase) private repo: Repository<Purchase>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private licensesService: LicensesService,
  ) {}

  async findAll(params?: PurchaseFilters) {
    const { page = 1, limit = 20, status, type, search, dateFrom, dateTo } = params || {};

    const qb = this.repo.createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.user', 'user')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.plan', 'plan');

    if (status) qb.andWhere('purchase.payment_status = :status', { status });
    if (type) qb.andWhere('purchase.purchase_type = :type', { type });
    if (search) {
      qb.andWhere('(user.username ILIKE :search OR user.email ILIKE :search OR purchase.transaction_id ILIKE :search)',
        { search: `%${search}%` });
    }
    if (dateFrom) qb.andWhere('purchase.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('purchase.created_at <= :dateTo', { dateTo: `${dateTo} 23:59:59` });

    const total = await qb.getCount();
    const data = await qb
      .orderBy('purchase.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findAllForExport(params?: Omit<PurchaseFilters, 'page' | 'limit'>) {
    const { status, type, search, dateFrom, dateTo } = params || {};

    const qb = this.repo.createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.user', 'user')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.plan', 'plan');

    if (status) qb.andWhere('purchase.payment_status = :status', { status });
    if (type) qb.andWhere('purchase.purchase_type = :type', { type });
    if (search) {
      qb.andWhere('(user.username ILIKE :search OR user.email ILIKE :search OR purchase.transaction_id ILIKE :search)',
        { search: `%${search}%` });
    }
    if (dateFrom) qb.andWhere('purchase.created_at >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('purchase.created_at <= :dateTo', { dateTo: `${dateTo} 23:59:59` });

    return qb.orderBy('purchase.created_at', 'DESC').getMany();
  }

  async getStats() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [total, completed, pending, refunded, monthlyRevenue] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { payment_status: PaymentStatus.COMPLETED } }),
      this.repo.count({ where: { payment_status: PaymentStatus.PENDING } }),
      this.repo.count({ where: { payment_status: PaymentStatus.REFUNDED } }),
      this.repo.createQueryBuilder('purchase')
        .select('COALESCE(SUM(purchase.price_paid), 0)', 'revenue')
        .where('purchase.payment_status = :status', { status: PaymentStatus.COMPLETED })
        .andWhere('purchase.created_at >= :startOfMonth', { startOfMonth })
        .getRawOne(),
    ]);

    return { total, completed, pending, refunded, monthlyRevenue: parseFloat(monthlyRevenue?.revenue || '0') };
  }

  async findById(id: number): Promise<Purchase> {
    const purchase = await this.repo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.user', 'user')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.plan', 'plan')
      .where('purchase.id = :id', { id })
      .getOne();
    if (!purchase) throw new NotFoundException('Purchase not found');
    return purchase;
  }

  async findByUser(userId: number): Promise<Purchase[]> {
    return this.repo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.plan', 'plan')
      .where('purchase.user_id = :userId', { userId })
      .orderBy('purchase.created_at', 'DESC')
      .getMany();
  }

  async refund(id: number): Promise<Purchase> {
    const purchase = await this.findById(id);
    purchase.payment_status = PaymentStatus.REFUNDED;
    return this.repo.save(purchase);
  }

  async createCheckout(userId: number, dto: CreateCheckoutDto, ipAddress?: string): Promise<Purchase[]> {
    // Validate products exist
    const productIds = dto.items.map(item => item.id);
    const products = await this.productRepo.find({ where: { id: In(productIds) } });

    if (products.length !== dto.items.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    // Calculate totals
    const purchases: Purchase[] = [];
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    for (const item of dto.items) {
      const product = products.find(p => p.id === item.id);
      if (!product) continue;

      const originalPrice = Number(product.price);
      const discountPerItem = dto.discount_amount
        ? (dto.discount_amount / dto.items.length)
        : 0;
      const pricePaid = Math.max(0, originalPrice - discountPerItem);

      const purchase = this.repo.create({
        user_id: userId,
        purchase_type: PurchaseType.PRODUCT,
        product_id: product.id,
        quantity: 1,
        original_price: originalPrice,
        price_paid: pricePaid,
        coupon_code: dto.coupon_code || null,
        discount_amount: discountPerItem,
        payment_method: dto.payment_method,
        payment_status: dto.payment_method === 'discord' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
        transaction_id: transactionId,
        ip_address: ipAddress,
      });

      purchases.push(await this.repo.save(purchase));
    }

    return purchases;
  }

  async findByTransactionId(transactionId: string): Promise<Purchase[]> {
    return this.repo.find({
      where: { transaction_id: transactionId },
      relations: ['product', 'plan'],
    });
  }

  async claimFreeProduct(userId: number, productId: number, ipAddress?: string): Promise<Purchase> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (Number(product.price) > 0) throw new BadRequestException('El producto no es gratuito');

    // Check if user already has this product active in their license
    const license = await this.licensesService.findByUserId(userId);
    if (license && this.licensesService.hasActiveProduct(license, productId)) {
      throw new BadRequestException('Ya posees este producto');
    }

    const transactionId = `FREE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const purchase = this.repo.create({
      user_id: userId,
      purchase_type: PurchaseType.PRODUCT,
      product_id: product.id,
      quantity: 1,
      original_price: 0,
      price_paid: 0,
      payment_method: 'free',
      payment_status: PaymentStatus.COMPLETED,
      transaction_id: transactionId,
      ip_address: ipAddress,
    });

    const savedPurchase = await this.repo.save(purchase);

    // Add product to user's license (permanent access)
    await this.licensesService.addProduct(userId, productId, null, 'purchase');

    return savedPurchase;
  }
}
