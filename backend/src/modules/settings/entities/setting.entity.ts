import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('settings')
export class Setting {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true, length: 100 })
  key: string;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  value: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
