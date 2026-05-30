import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @ApiProperty() @Column({ name: 'discord_id', type: 'varchar', length: 20, unique: true }) discord_id: string;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) username: string;
  @ApiProperty() @Column({ type: 'varchar', length: 150, nullable: true }) email: string;
  @ApiProperty() @Column({ type: 'varchar', length: 255, nullable: true }) avatar: string;
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }) ip_address: string;
  @ApiProperty({ enum: UserRole }) @Column({ type: 'enum', enum: UserRole, default: UserRole.USER }) role: UserRole;
  @ApiProperty({ enum: UserStatus }) @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE }) status: UserStatus;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
  @Column({ name: 'last_login', type: 'timestamp', nullable: true }) last_login: Date;
}
