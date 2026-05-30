import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment, LogLevel, OrdersController, PaymentsController } from '@paypal/paypal-server-sdk';

@Injectable()
export class PayPalConfig {
  private client: Client;
  public orders: OrdersController;
  public payments: PaymentsController;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_SECRET');
    const environment = this.configService.get<string>('NODE_ENV') === 'production'
      ? Environment.Production
      : Environment.Sandbox;

    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      environment,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
      },
    });

    this.orders = new OrdersController(this.client);
    this.payments = new PaymentsController(this.client);
  }

  getClient(): Client {
    return this.client;
  }
}
