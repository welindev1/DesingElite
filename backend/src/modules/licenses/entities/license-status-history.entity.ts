import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { License, LicenseStatus } from './license.entity';
import { User } from '../../users/entities/user.entity';

@Entity('license_status_history')
export class LicenseStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'license_id', type: 'bigint' }) license_id: number;
  @Column({ name: 'previous_status', type: 'enum', enum: LicenseStatus, nullable: true }) previous_status: LicenseStatus;
  @Column({ name: 'new_status', type: 'enum', enum: LicenseStatus }) new_status: LicenseStatus;
  @Column({ type: 'text', nullable: true }) reason: string;
  @Column({ name: 'changed_by', type: 'bigint', nullable: true }) changed_by: number;
  @CreateDateColumn({ name: 'changed_at' }) changed_at: Date;

  @ManyToOne(() => License, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'license_id' }) license: License;
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'changed_by' }) changedByUser: User;
}
