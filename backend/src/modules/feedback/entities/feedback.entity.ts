import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn({ type: 'bigint' }) id: number;
  @Column({ name: 'user_id', type: 'bigint' }) user_id: number;
  @Column({ name: 'product_id', type: 'bigint', nullable: true }) product_id: number;
  @Column({ type: 'smallint' }) rating: number;
  @Column({ type: 'text' }) comment: string;
  @Column({ name: 'is_visible', type: 'boolean', default: true }) is_visible: boolean;
  @Column({ name: 'is_featured', type: 'boolean', default: false }) is_featured: boolean;
  @CreateDateColumn({ name: 'created_at' }) created_at: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true }) @JoinColumn({ name: 'user_id' }) user: User;
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL', eager: true }) @JoinColumn({ name: 'product_id' }) product: Product;
}
