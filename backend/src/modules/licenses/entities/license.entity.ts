import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum LicenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export interface LicenseProduct {
  product_id: number;
  expires_at: string | null;
  added_at: string;
  added_by: string;
}

@Entity('licenses')
export class License {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'user_id', type: 'bigint' }) user_id: number;
  @ApiProperty() @Column({ name: 'license_key', type: 'varchar', length: 64, unique: true }) license_key: string;
  @ApiProperty() @Column({ type: 'jsonb', default: '[]' }) products: LicenseProduct[];
  @ApiProperty() @Column({ name: 'authorized_ip', type: 'varchar', length: 45, nullable: true }) authorized_ip: string;
  @ApiProperty() @Column({ name: 'authorized_port', type: 'integer', nullable: true }) authorized_port: number;
  @ApiProperty({ enum: LicenseStatus }) @Column({ type: 'enum', enum: LicenseStatus, default: LicenseStatus.ACTIVE }) status: LicenseStatus;
  @Column({ name: 'status_reason', type: 'text', nullable: true }) status_reason: string;
  @Column({ name: 'status_changed_at', type: 'timestamp', nullable: true }) status_changed_at: Date;
  @Column({ name: 'status_changed_by', type: 'bigint', nullable: true }) status_changed_by: number;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
  @Column({ name: 'last_used', type: 'timestamp', nullable: true }) last_used: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
