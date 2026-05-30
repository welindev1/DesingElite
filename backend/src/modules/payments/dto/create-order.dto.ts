import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNumber()
  product_id: number;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unit price', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty({ description: 'Quantity', minimum: 1, default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class PlanItemDto {
  @ApiProperty({ description: 'Plan ID' })
  @IsNumber()
  plan_id: number;

  @ApiProperty({ description: 'Plan name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Plan price', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Cart items (products)', type: [CartItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  items?: CartItemDto[];

  @ApiProperty({ description: 'Plan to purchase', type: PlanItemDto, required: false })
  @ValidateNested()
  @Type(() => PlanItemDto)
  @IsOptional()
  plan?: PlanItemDto;

  @ApiProperty({ description: 'Coupon code', required: false })
  @IsString()
  @IsOptional()
  coupon_code?: string;
}

export class CreateOrderResponseDto {
  @ApiProperty({ description: 'PayPal Order ID' })
  order_id: string;

  @ApiProperty({ description: 'Order status' })
  status: string;

  @ApiProperty({ description: 'Approval URL for redirect' })
  approval_url: string;
}
