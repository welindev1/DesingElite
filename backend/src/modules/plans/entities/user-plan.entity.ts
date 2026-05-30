import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Plan } from './plan.entity';

export enum UserPlanStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('user_plans')
export class UserPlan {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'user_id', type: 'bigint' }) user_id: number;
  @Column({ name: 'plan_id', type: 'int' }) plan_id: number;
  @Column({ name: 'starts_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) starts_at: Date;
  @ApiProperty() @Column({ name: 'expires_at', type: 'timestamp' }) expires_at: Date;
  @ApiProperty({ enum: UserPlanStatus }) @Column({ type: 'enum', enum: UserPlanStatus, default: UserPlanStatus.ACTIVE }) status: UserPlanStatus;
  @Column({ name: 'auto_renew', type: 'boolean', default: false }) auto_renew: boolean;
  @ApiProperty() @Column({ name: 'assigned_by', type: 'varchar', length: 20, default: 'admin' }) assigned_by: 'admin' | 'purchase';
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_id' }) user: User;
  @ManyToOne(() => Plan, { onDelete: 'CASCADE', eager: true }) @JoinColumn({ name: 'plan_id' }) plan: Plan;
}
