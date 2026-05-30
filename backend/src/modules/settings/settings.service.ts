import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { WebhooksConfig } from './dto/update-webhooks.dto';

const WEBHOOK_KEYS = [
  'webhook_users',
  'webhook_licenses',
  'webhook_purchases',
  'webhook_purchases_detailed',
  'webhook_coupons',
] as const;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting) private repo: Repository<Setting>,
  ) {}

  async get(key: string): Promise<string | null> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: string | null): Promise<Setting> {
    let setting = await this.repo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.repo.create({ key, value });
    }
    return this.repo.save(setting);
  }

  async getWebhooks(): Promise<WebhooksConfig> {
    const settings = await this.repo.find({
      where: { key: In([...WEBHOOK_KEYS]) },
    });

    const result: WebhooksConfig = {
      webhook_users: null,
      webhook_licenses: null,
      webhook_purchases: null,
      webhook_purchases_detailed: null,
      webhook_coupons: null,
    };

    for (const setting of settings) {
      if (WEBHOOK_KEYS.includes(setting.key as any)) {
        result[setting.key as keyof WebhooksConfig] = setting.value;
      }
    }

    return result;
  }

  async updateWebhooks(webhooks: Partial<WebhooksConfig>): Promise<WebhooksConfig> {
    for (const [key, value] of Object.entries(webhooks)) {
      if (WEBHOOK_KEYS.includes(key as any)) {
        await this.set(key, value || null);
      }
    }
    return this.getWebhooks();
  }

  async getWebhookUrl(key: keyof WebhooksConfig): Promise<string | null> {
    return this.get(key);
  }
}
