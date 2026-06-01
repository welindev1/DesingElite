import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';

interface PurchaseNotificationData {
  username: string;
  discordId: string;
  avatar?: string;
  items: Array<{ name: string; price: number; quantity: number; image?: string }>;
  plan?: { name: string; price: number; image?: string };
  total: number;
  discount: number;
  couponCode?: string;
  transactionId?: string;
  image?: string;
}

interface UserLogData {
  userId: number;
  username: string;
  avatar?: string;
  changeType: 'status' | 'role';
  previousValue: string;
  newValue: string;
  changedBy?: string;
}

interface LicenseLogData {
  userId: number;
  username: string;
  avatar?: string;
  productId: number;
  productName: string;
  productImage?: string;
  licenseKey: string;
  addedBy: 'admin' | 'purchase';
  expiresAt?: string | null;
}

interface CouponLogData {
  userId: number;
  username: string;
  avatar?: string;
  couponCode: string;
  discountAmount: number;
  discountType: string;
  originalTotal: number;
  finalTotal: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly discordWebhookUrl: string;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService,
  ) {
    this.discordWebhookUrl = this.configService.get<string>('DISCORD_WEBHOOK_URL') || '';
  }

  private async sendDiscordWebhook(url: string, payload: object): Promise<void> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }
  }

  async sendUserLog(data: UserLogData): Promise<void> {
    const webhookUrl = await this.settingsService.getWebhookUrl('webhook_users');
    if (!webhookUrl) {
      this.logger.debug('User webhook not configured, skipping notification');
      return;
    }

    try {
      const color = data.changeType === 'status'
        ? (data.newValue === 'active' ? 0x2ecc71 : data.newValue === 'banned' ? 0xe74c3c : 0xf39c12)
        : 0x3498db;

      const payload = {
        embeds: [{
          title: data.changeType === 'status' ? '👤 Cambio de Estado de Usuario' : '🔑 Cambio de Rol de Usuario',
          color,
          thumbnail: { url: data.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png' },
          fields: [
            { name: 'Usuario', value: data.username, inline: true },
            { name: 'ID', value: `\`${data.userId}\``, inline: true },
            { name: data.changeType === 'status' ? 'Estado Anterior' : 'Rol Anterior', value: `\`${data.previousValue}\``, inline: true },
            { name: data.changeType === 'status' ? 'Nuevo Estado' : 'Nuevo Rol', value: `\`${data.newValue}\``, inline: true },
            ...(data.changedBy ? [{ name: 'Modificado por', value: data.changedBy, inline: true }] : []),
          ],
          footer: { text: 'DisenosElite', icon_url: 'https://imgur.com/wXxqhIV.png' },
          timestamp: new Date().toISOString(),
        }],
      };

      await this.sendDiscordWebhook(webhookUrl, payload);
      this.logger.log(`User log sent for user ${data.username}`);
    } catch (error) {
      this.logger.error('Failed to send user log:', error);
    }
  }

  async sendLicenseLog(data: LicenseLogData): Promise<void> {
    const webhookUrl = await this.settingsService.getWebhookUrl('webhook_licenses');
    if (!webhookUrl) {
      this.logger.debug('License webhook not configured, skipping notification');
      return;
    }

    try {
      const payload = {
        embeds: [{
          title: '🔐 Producto Agregado a Licencia',
          color: data.addedBy === 'purchase' ? 0x2ecc71 : 0x9b59b6,
          thumbnail: data.productImage ? { url: data.productImage } : { url: 'https://cdn.discordapp.com/embed/avatars/0.png' },
          fields: [
            { name: 'Usuario', value: data.username, inline: true },
            { name: 'Producto', value: data.productName, inline: true },
            { name: 'Licencia', value: `\`${data.licenseKey.substring(0, 8)}...\``, inline: true },
            { name: 'Método', value: data.addedBy === 'purchase' ? '🛒 Compra' : '👨‍💼 Admin', inline: true },
            { name: 'Expiración', value: data.expiresAt ? new Date(data.expiresAt).toLocaleDateString('es-ES') : '♾️ Permanente', inline: true },
          ],
          footer: { text: 'DisenosElite', icon_url: 'https://imgur.com/wXxqhIV.png' },
          timestamp: new Date().toISOString(),
        }],
      };

      await this.sendDiscordWebhook(webhookUrl, payload);
      this.logger.log(`License log sent for user ${data.username} - product ${data.productName}`);
    } catch (error) {
      this.logger.error('Failed to send license log:', error);
    }
  }

  async sendPurchaseLog(transactionId: string, username: string, total: number): Promise<void> {
    const webhookUrl = await this.settingsService.getWebhookUrl('webhook_purchases');
    if (!webhookUrl) {
      this.logger.debug('Purchase webhook (simple) not configured, skipping notification');
      return;
    }

    try {
      const payload = {
        content: `🛒 **Nueva compra** | Usuario: **${username}** | Total: **$${total.toFixed(2)} USD** | TX: \`${transactionId}\``,
      };

      await this.sendDiscordWebhook(webhookUrl, payload);
      this.logger.log(`Simple purchase log sent for ${username}`);
    } catch (error) {
      this.logger.error('Failed to send purchase log:', error);
    }
  }

  async sendPurchaseDetailedLog(data: PurchaseNotificationData): Promise<void> {
    const webhookUrl = await this.settingsService.getWebhookUrl('webhook_purchases_detailed');
    if (!webhookUrl) {
      this.logger.debug('Purchase webhook (detailed) not configured, skipping notification');
      return;
    }

    try {
      const embed = this.buildPurchaseEmbed(data);
      await this.sendDiscordWebhook(webhookUrl, embed);
      this.logger.log(`Detailed purchase log sent for user ${data.username}`);
    } catch (error) {
      this.logger.error('Failed to send detailed purchase log:', error);
    }
  }

  async sendCouponLog(data: CouponLogData): Promise<void> {
    const webhookUrl = await this.settingsService.getWebhookUrl('webhook_coupons');
    if (!webhookUrl) {
      this.logger.debug('Coupon webhook not configured, skipping notification');
      return;
    }

    try {
      const payload = {
        embeds: [{
          title: '🏷️ Cupón Utilizado',
          color: 0xf1c40f,
          thumbnail: { url: data.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png' },
          fields: [
            { name: 'Usuario', value: data.username, inline: true },
            { name: 'Cupón', value: `\`${data.couponCode}\``, inline: true },
            { name: 'Tipo', value: data.discountType, inline: true },
            { name: 'Descuento Aplicado', value: `**-$${data.discountAmount.toFixed(2)}**`, inline: true },
            { name: 'Total Original', value: `$${data.originalTotal.toFixed(2)}`, inline: true },
            { name: 'Total Final', value: `**$${data.finalTotal.toFixed(2)}**`, inline: true },
          ],
          footer: { text: 'DisenosElite', icon_url: 'https://imgur.com/wXxqhIV.png' },
          timestamp: new Date().toISOString(),
        }],
      };

      await this.sendDiscordWebhook(webhookUrl, payload);
      this.logger.log(`Coupon log sent for user ${data.username} - coupon ${data.couponCode}`);
    } catch (error) {
      this.logger.error('Failed to send coupon log:', error);
    }
  }

  // Legacy method - maintains backwards compatibility with existing purchases webhook from env
  async sendPurchaseNotification(data: PurchaseNotificationData): Promise<void> {
    // Send to the detailed webhook from settings
    await this.sendPurchaseDetailedLog(data);

    // Also send to simple webhook
    await this.sendPurchaseLog(data.transactionId, data.username, data.total);

    // Fallback to env-based webhook for backwards compatibility
    if (!this.discordWebhookUrl) {
      return;
    }

    try {
      const embed = this.buildPurchaseEmbed(data);
      await this.sendDiscordWebhook(this.discordWebhookUrl, embed);
      this.logger.log(`Purchase notification sent for user ${data.username}`);
    } catch (error) {
      this.logger.error('Failed to send purchase notification:', error);
    }
  }

  private buildPurchaseEmbed(data: PurchaseNotificationData): object {
    // Build product list
    const productsList: string[] = [];
    if (data.items?.length) {
      for (const item of data.items) {
        productsList.push(`• ${item.name}`);
      }
    }
    if (data.plan) {
      productsList.push(`• ${data.plan.name}`);
    }

    // Get image (from first product, plan, or passed image)
    const embedImage = data.image
      || data.items?.[0]?.image
      || data.plan?.image
      || null;

    const fields: Array<{ name: string; value: string; inline?: boolean }> = [
      { name: 'Cliente', value: `<@${data.discordId}>`, inline: false },
      { name: 'Producto(s)', value: productsList.join('\n') || 'N/A', inline: false },
      { name: 'Total Pagado', value: `$${data.total.toFixed(0)} USD`, inline: false },
    ];

    const embed: any = {
      title: '✅ Compra Realizada Exitosamente',
      description: 'Nueva compra realizada en DisenosElite.',
      color: 0x2ecc71,
      fields,
      footer: {
        text: 'DisenosElite',
        icon_url: 'https://imgur.com/wXxqhIV.png',
      },
      timestamp: new Date().toISOString(),
    };

    // Add image if available
    if (embedImage) {
      embed.image = { url: embedImage };
    }

    return { embeds: [embed] };
  }

  async sendRefundNotification(
    username: string,
    transactionId: string,
    amount: number,
  ): Promise<void> {
    if (!this.discordWebhookUrl) return;

    try {
      const payload = {
        embeds: [
          {
            title: '⚠️ Reembolso Procesado',
            color: 0xe74c3c, // Red
            fields: [
              { name: 'Usuario', value: username, inline: true },
              { name: 'Monto', value: `$${amount.toFixed(2)} USD`, inline: true },
              { name: 'ID Transacción', value: `\`${transactionId}\``, inline: false },
            ],
            footer: { text: 'DisenosElite', icon_url: 'https://imgur.com/wXxqhIV.png' },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await this.sendDiscordWebhook(this.discordWebhookUrl, payload);
      this.logger.log(`Refund notification sent for transaction ${transactionId}`);
    } catch (error) {
      this.logger.error('Failed to send refund notification:', error);
    }
  }
}
