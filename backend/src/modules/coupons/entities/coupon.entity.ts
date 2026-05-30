import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DiscountType { PERCENTAGE = 'percentage', FIXED = 'fixed' }
export enum CouponAppliesTo { PRODUCTS = 'products', PLANS = 'plans', ALL = 'all' }
export enum CouponStatus { ACTIVE = 'active', INACTIVE = 'inactive' }

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn({ type: 'int' }) id: number;
  @Column({ type: 'varchar', length: 50, unique: true }) code: string;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType, default: DiscountType.PERCENTAGE }) discount_type: DiscountType;
  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 }) discount_value: number;
  @Column({ name: 'applies_to', type: 'enum', enum: CouponAppliesTo, default: CouponAppliesTo.ALL }) applies_to: CouponAppliesTo;
  @Column({ name: 'product_ids', type: 'jsonb', nullable: true }) product_ids: number[];
  @Column({ name: 'plan_ids', type: 'jsonb', nullable: true }) plan_ids: number[];
  @Column({ name: 'start_date', type: 'timestamp' }) start_date: Date;
  @Column({ name: 'end_date', type: 'timestamp' }) end_date: Date;
  @Column({ name: 'max_uses', type: 'integer', nullable: true }) max_uses: number;
  @Column({ name: 'current_uses', type: 'integer', default: 0 }) current_uses: number;
  @Column({ name: 'min_purchase', type: 'decimal', precision: 10, scale: 2, default: 0 }) min_purchase: number;
  @Column({ type: 'enum', enum: CouponStatus, default: CouponStatus.ACTIVE }) status: CouponStatus;
  @Column({ name: 'created_by', type: 'bigint', nullable: true }) created_by: number;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'created_by' }) createdByUser: User;
}
