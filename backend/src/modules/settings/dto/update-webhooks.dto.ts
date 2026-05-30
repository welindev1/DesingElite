import { IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWebhooksDto {
  @ApiProperty({ required: false, description: 'Webhook para logs de usuarios' })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== '')
  webhook_users?: string | null;

  @ApiProperty({ required: false, description: 'Webhook para logs de licencias' })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== '')
  webhook_licenses?: string | null;

  @ApiProperty({ required: false, description: 'Webhook para logs de compras (simple)' })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== '')
  webhook_purchases?: string | null;

  @ApiProperty({ required: false, description: 'Webhook para logs de compras (detallado con imagen)' })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== '')
  webhook_purchases_detailed?: string | null;

  @ApiProperty({ required: false, description: 'Webhook para logs de cupones' })
  @IsOptional()
  @ValidateIf((o, v) => v !== null && v !== '')
  webhook_coupons?: string | null;
}

export interface WebhooksConfig {
  webhook_users: string | null;
  webhook_licenses: string | null;
  webhook_purchases: string | null;
  webhook_purchases_detailed: string | null;
  webhook_coupons: string | null;
}
