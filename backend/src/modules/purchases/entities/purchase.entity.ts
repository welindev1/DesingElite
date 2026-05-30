import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Plan } from '../../plans/entities/plan.entity';

export enum PurchaseType { PRODUCT = 'product', PLAN = 'plan', RENEWAL = 'renewal' }
export enum PaymentStatus { PENDING = 'pending', COMPLETED = 'completed', FAILED = 'failed', REFUNDED = 'refunded' }

@Entity('purchases')
export class Purchase {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'user_id', type: 'bigint' }) user_id: number;
  @ApiProperty({ enum: PurchaseType }) @Column({ name: 'purchase_type', type: 'enum', enum: PurchaseType, default: PurchaseType.PRODUCT }) purchase_type: PurchaseType;
  @Column({ name: 'product_id', type: 'bigint', nullable: true }) product_id: number;
  @Column({ name: 'plan_id', type: 'int', nullable: true }) plan_id: number;
  @Column({ type: 'integer', default: 1 }) quantity: number;
  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2 }) original_price: number;
  @Column({ name: 'price_paid', type: 'decimal', precision: 10, scale: 2 }) price_paid: number;
  @Column({ name: 'coupon_code', type: 'varchar', length: 50, nullable: true }) coupon_code: string;
  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 }) discount_amount: number;
  @Column({ name: 'payment_method', type: 'varchar', length: 50 }) payment_method: string;
  @ApiProperty({ enum: PaymentStatus }) @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) payment_status: PaymentStatus;
  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true }) transaction_id: string;
  @Column({ name: 'payment_details', type: 'jsonb', nullable: true }) payment_details: any;
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }) ip_address: string;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true }) completed_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'product_id' }) product: Product;
  @ManyToOne(() => Plan, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'plan_id' }) plan: Plan;
}
