import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from '../../users/entities/user.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';

@Entity('coupon_usage')
export class CouponUsage {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'coupon_id', type: 'int' }) coupon_id: number;
  @Column({ name: 'user_id', type: 'bigint' }) user_id: number;
  @Column({ name: 'purchase_id', type: 'bigint', nullable: true }) purchase_id: number;
  @Column({ name: 'discount_applied', type: 'decimal', precision: 10, scale: 2 }) discount_applied: number;
  @CreateDateColumn({ name: 'used_at' }) used_at: Date;

  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'coupon_id' }) coupon: Coupon;
  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  @ManyToOne(() => Purchase, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'purchase_id' }) purchase: Purchase;
}
