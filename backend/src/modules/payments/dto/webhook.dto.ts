import { ApiProperty } from '@nestjs/swagger';

export class PayPalWebhookEventDto {
  @ApiProperty({ description: 'Webhook event ID' })
  id: string;

  @ApiProperty({ description: 'Event type (e.g., PAYMENT.CAPTURE.COMPLETED)' })
  event_type: string;

  @ApiProperty({ description: 'Timestamp when event occurred' })
  create_time: string;

  @ApiProperty({ description: 'Resource type' })
  resource_type: string;

  @ApiProperty({ description: 'Event resource data' })
  resource: {
    id?: string;
    status?: string;
    amount?: { currency_code: string; value: string };
    custom_id?: string;
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
    [key: string]: any;
  };

  @ApiProperty({ description: 'Summary of the event' })
  summary?: string;
}

export class WebhookVerificationDto {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: PayPalWebhookEventDto;
}
