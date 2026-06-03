import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductCategory {
  SCRIPTS = 'scripts',
  PLANS = 'plans',
  MODELS = 'models',
}

@Entity('products')
export class Product {
  @ApiProperty() @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @ApiProperty() @Column({ type: 'varchar', length: 100 }) name: string;
  @ApiProperty() @Column({ type: 'text', nullable: true }) description: string;
  @ApiProperty() @Column({ name: 'short_description', type: 'varchar', length: 255, nullable: true }) short_description: string;
  @ApiProperty() @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) price: number;
  @ApiProperty({ enum: ProductCategory, default: ProductCategory.SCRIPTS })
  @Column({ type: 'varchar', length: 50, default: ProductCategory.SCRIPTS }) category: ProductCategory;
  @ApiProperty({ description: 'Imagen principal (link de Imgur u otro CDN)', example: 'https://i.imgur.com/AbCdEfG.png' })
  @Column({ name: 'image', type: 'text', nullable: true }) image: string;
  @ApiProperty({ description: 'Imágenes adicionales para slider/galería (max 10)', type: [String], default: [] })
  @Column({ name: 'gallery_images', type: 'jsonb', default: '[]' }) gallery_images: string[];
  @ApiProperty({ description: 'Video de YouTube (link opcional)', example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', required: false })
  @Column({ name: 'video_url', type: 'text', nullable: true }) video_url: string;
  @ApiProperty({ description: 'Link de descarga (Drive, Mega, etc.) — solo visible con acceso' })
  @Column({ name: 'download_link', type: 'text', nullable: true }) download_link: string;
  @ApiProperty() @Column({ type: 'boolean', default: true }) visible: boolean;
  @ApiProperty({ description: 'Orden de visualización (mayor = más arriba)' })
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sort_order: number;
  @ApiProperty() @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @ApiProperty() @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;
}
