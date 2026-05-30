import { Controller, Get, Patch, Body, Post, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateWebhooksDto, WebhooksConfig } from './dto/update-webhooks.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('webhooks')
  @ApiOperation({ summary: 'Get all Discord webhooks configuration' })
  async getWebhooks(): Promise<WebhooksConfig> {
    return this.settingsService.getWebhooks();
  }

  @Patch('webhooks')
  @ApiOperation({ summary: 'Update Discord webhooks configuration' })
  async updateWebhooks(@Body() dto: UpdateWebhooksDto): Promise<WebhooksConfig> {
    return this.settingsService.updateWebhooks(dto);
  }

  @Post('webhooks/test')
  @ApiOperation({ summary: 'Test a Discord webhook' })
  async testWebhook(@Query('type') type: string): Promise<{ success: boolean; message: string }> {
    const validTypes = ['users', 'licenses', 'purchases', 'purchases_detailed', 'coupons'];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid webhook type');
    }

    const key = `webhook_${type}` as keyof WebhooksConfig;
    const url = await this.settingsService.getWebhookUrl(key);

    if (!url) {
      return { success: false, message: 'Webhook URL not configured' };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🧪 Test de Webhook',
            description: `Este es un mensaje de prueba para el webhook de **${type}**.`,
            color: 0x3498db,
            footer: { text: 'WelinStore' },
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      if (!response.ok) {
        return { success: false, message: `Discord returned status ${response.status}` };
      }

      return { success: true, message: 'Webhook test sent successfully' };
    } catch (error) {
      return { success: false, message: `Failed to send webhook: ${error.message}` };
    }
  }
}
