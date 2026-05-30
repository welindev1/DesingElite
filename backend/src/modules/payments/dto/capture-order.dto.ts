import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CaptureOrderDto {
  @ApiProperty({ description: 'PayPal Order ID to capture' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}

export class CaptureOrderResponseDto {
  @ApiProperty({ description: 'Payment was successful' })
  success: boolean;

  @ApiProperty({ description: 'Transaction ID' })
  transaction_id: string;

  @ApiProperty({ description: 'Purchase ID in our system' })
  purchase_id: number;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Message' })
  message: string;
}
