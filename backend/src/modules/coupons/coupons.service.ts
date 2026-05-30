import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponStatus, DiscountType, CouponAppliesTo } from './entities/coupon.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsDateString, IsPositive, MinLength, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELIN20' }) @IsString() @MinLength(3) @MaxLength(50) code: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: DiscountType }) @IsEnum(DiscountType) discount_type: DiscountType;
  @ApiProperty({ example: 20 }) @IsNumber() @IsPositive() discount_value: number;
  @ApiProperty({ enum: CouponAppliesTo, required: false }) @IsOptional() @IsEnum(CouponAppliesTo) applies_to?: CouponAppliesTo;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() product_ids?: number[];
  @ApiProperty({ required: false }) @IsOptional() @IsArray() plan_ids?: number[];
  @ApiProperty() @IsDateString() start_date: string;
  @ApiProperty() @IsDateString() end_date: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() max_uses?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) min_purchase?: number;
}

import { CouponUsage } from './entities/coupon-usage.entity';

interface RecordUsageOptions {
  username?: string;
  avatar?: string;
  originalTotal?: number;
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon) private repo: Repository<Coupon>,
    @InjectRepository(CouponUsage) private usageRepo: Repository<CouponUsage>,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Coupon[]> { return this.repo.find({ order: { created_at: 'DESC' } }); }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.repo.create({ ...dto, start_date: new Date(dto.start_date), end_date: new Date(dto.end_date) });
    return this.repo.save(coupon);
  }

  async update(id: number, dto: Partial<CreateCouponDto>): Promise<Coupon> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    Object.assign(coupon, dto);
    return this.repo.save(coupon);
  }

  async delete(id: number): Promise<void> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.repo.remove(coupon);
  }

  async validate(code: string, price: number): Promise<Coupon> {
    const coupon = await this.repo.findOne({ where: { code, status: CouponStatus.ACTIVE } });
    if (!coupon) throw new NotFoundException('Coupon not found or inactive');
    const now = new Date();
    if (now < coupon.start_date || now > coupon.end_date) throw new BadRequestException('Coupon is expired or not yet active');
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) throw new BadRequestException('Coupon usage limit reached');
    if (price < Number(coupon.min_purchase)) throw new BadRequestException(`Minimum purchase is $${coupon.min_purchase}`);
    return coupon;
  }

  calculateDiscount(coupon: Coupon, price: number): number {
    if (coupon.discount_type === DiscountType.PERCENTAGE) return (price * Number(coupon.discount_value)) / 100;
    return Math.min(Number(coupon.discount_value), price);
  }

  async recordUsage(code: string, userId: number, purchaseId: number, discountApplied: number = 0, options?: RecordUsageOptions): Promise<void> {
    const coupon = await this.repo.findOne({ where: { code } });
    if (!coupon) return;
    await this.usageRepo.save({
      coupon_id: coupon.id,
      user_id: userId,
      purchase_id: purchaseId,
      discount_applied: discountApplied,
    });
    coupon.current_uses += 1;
    await this.repo.save(coupon);

    // Send coupon log webhook
    if (options?.username) {
      const originalTotal = options.originalTotal || discountApplied;
      const finalTotal = originalTotal - discountApplied;
      this.notificationsService.sendCouponLog({
        userId,
        username: options.username,
        avatar: options.avatar,
        couponCode: code,
        discountAmount: discountApplied,
        discountType: coupon.discount_type === DiscountType.PERCENTAGE ? `${coupon.discount_value}%` : `$${coupon.discount_value}`,
        originalTotal,
        finalTotal,
      }).catch(() => {});
    }
  }

  async findOne(id: number): Promise<Coupon> {
    const coupon = await this.repo.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async getUsages(couponId: number): Promise<CouponUsage[]> {
    await this.findOne(couponId);
    return this.usageRepo.find({
      where: { coupon_id: couponId },
      relations: ['user'],
      order: { used_at: 'DESC' },
    });
  }

  async toggleStatus(id: number): Promise<Coupon> {
    const coupon = await this.findOne(id);
    coupon.status = coupon.status === CouponStatus.ACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE;
    return this.repo.save(coupon);
  }

  async getAvailableCoupons(): Promise<Coupon[]> {
    const now = new Date();
    return this.repo
      .createQueryBuilder('c')
      .where('c.status = :status', { status: CouponStatus.ACTIVE })
      .andWhere('c.start_date <= :now', { now })
      .andWhere('c.end_date >= :now', { now })
      .andWhere('(c.max_uses IS NULL OR c.current_uses < c.max_uses)')
      .orderBy('c.discount_value', 'DESC')
      .getMany();
  }
}
