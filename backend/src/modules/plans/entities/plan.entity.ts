import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('plans')
export class Plan {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'int' }) id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) description: string;
  @ApiProperty() @Column({ type: 'varchar', length: 500, nullable: true }) image: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 10, scale: 2 }) price: number;
  @ApiProperty() @Column({ name: 'duration_days', type: 'integer', default: 30 }) duration_days: number;
  @ApiProperty({ type: [Number] }) @Column({ name: 'product_ids', type: 'jsonb', default: '[]' }) product_ids: number[];
  @ApiProperty() @Column({ name: 'is_active', type: 'boolean', default: true }) is_active: boolean;
  @ApiProperty() @Column({ name: 'sort_order', type: 'integer', default: 0 }) sort_order: number;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
