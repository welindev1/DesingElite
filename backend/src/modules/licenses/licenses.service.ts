import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDays } from 'date-fns';
import { License, LicenseProduct, LicenseStatus } from './entities/license.entity';
import { LicenseStatusHistory } from './entities/license-status-history.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class LicensesService {
  constructor(
    @InjectRepository(License) private repo: Repository<License>,
    @InjectRepository(LicenseStatusHistory) private historyRepo: Repository<LicenseStatusHistory>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @Inject(forwardRef(() => NotificationsService)) private notificationsService: NotificationsService,
  ) {}

  async findByKey(licenseKey: string): Promise<License | null> {
    return this.repo.findOne({ where: { license_key: licenseKey }, relations: ['user'] });
  }

  async findByUserId(userId: number): Promise<License | null> {
    console.log('findByUserId - searching for userId:', userId, 'type:', typeof userId);
    const result = await this.repo
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.user', 'user')
      .where('CAST(license.user_id AS TEXT) = :userId', { userId: String(userId) })
      .getOne();
    console.log('findByUserId - result:', result ? `Found license ${result.id}` : 'NOT FOUND');
    return result;
  }

  async findAll(params?: { page?: number; limit?: number; status?: LicenseStatus }) {
    const { page = 1, limit = 20, status } = params || {};
    const where: any = {};
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where, skip: (page - 1) * limit, take: limit,
      relations: ['user'], order: { created_at: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number): Promise<License | null> {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  hasActiveProduct(license: License, productId: number): boolean {
    const products: LicenseProduct[] = license.products || [];
    const product = products.find((p) => Number(p.product_id) === Number(productId));
    if (!product) return false;
    if (product.expires_at === null) return true;
    return new Date(product.expires_at) > new Date();
  }

  getActiveProducts(license: License): LicenseProduct[] {
    const products: LicenseProduct[] = license.products || [];
    return products.filter((p) => p.expires_at === null || new Date(p.expires_at) > new Date());
  }

  async addProduct(userId: number, productId: number, days?: number, addedBy: string = 'admin'): Promise<License> {
    const license = await this.findByUserId(userId);
    if (!license) throw new NotFoundException('License not found');
    const products: LicenseProduct[] = license.products || [];
    const expiresAt = days ? addDays(new Date(), days).toISOString() : null;
    const idx = products.findIndex((p) => Number(p.product_id) === Number(productId));
    if (idx !== -1) {
      products[idx].expires_at = expiresAt;
      products[idx].added_by = addedBy;
    } else {
      products.push({
        product_id: Number(productId),
        expires_at: expiresAt,
        added_at: new Date().toISOString(),
        added_by: addedBy,
      });
    }
    license.products = products;
    const savedLicense = await this.repo.save(license);

    // Send webhooks
    try {
      const product = await this.productRepo.findOne({ where: { id: productId } });
      if (license.user && product) {
        // Determine if this was a purchase or admin action
        const webhookAddedBy: 'admin' | 'purchase' = addedBy === 'purchase' ? 'purchase' : 'admin';

        // Send license log webhook
        this.notificationsService.sendLicenseLog({
          userId: license.user.id,
          username: license.user.username,
          avatar: license.user.avatar,
          productId,
          productName: product.name,
          productImage: product.image,
          licenseKey: license.license_key,
          addedBy: webhookAddedBy,
          expiresAt,
        }).catch(() => {});

        // Send detailed purchase webhook (for both admin and purchase)
        this.notificationsService.sendPurchaseDetailedLog({
          username: license.user.username,
          discordId: license.user.discord_id,
          avatar: license.user.avatar,
          items: [{
            name: product.name,
            price: Number(product.price) || 0,
            quantity: 1,
            image: product.image,
          }],
          total: Number(product.price) || 0,
          discount: 0,
          image: product.image,
        }).catch(() => {});
      }
    } catch {}

    return savedLicense;
  }

  async removeProduct(userId: number, productId: number): Promise<License> {
    const license = await this.findByUserId(userId);
    if (!license) throw new NotFoundException('License not found');
    license.products = (license.products || []).filter((p) => Number(p.product_id) !== Number(productId));
    return this.repo.save(license);
  }

  async changeStatus(userId: number, newStatus: LicenseStatus, reason?: string, changedBy?: number): Promise<License> {
    const license = await this.findByUserId(userId);
    if (!license) throw new NotFoundException('License not found');
    await this.historyRepo.save({
      license_id: license.id, previous_status: license.status,
      new_status: newStatus, reason: reason || null, changed_by: changedBy || null,
    });
    license.status = newStatus;
    license.status_reason = reason || null;
    license.status_changed_at = new Date();
    license.status_changed_by = changedBy || null;
    return this.repo.save(license);
  }

  async updateLastUsed(licenseId: number): Promise<void> {
    await this.repo.update(licenseId, { last_used: new Date() });
  }

  async updateNetworkConfig(userId: number, ip: string, port: number): Promise<License> {
    const license = await this.findByUserId(userId);
    if (!license) throw new NotFoundException('License not found');
    license.authorized_ip = ip;
    license.authorized_port = port;
    return this.repo.save(license);
  }

  async getStatusHistory(userId: number): Promise<LicenseStatusHistory[]> {
    const license = await this.findByUserId(userId);
    if (!license) throw new NotFoundException('License not found');
    return this.historyRepo.find({ where: { license_id: license.id }, order: { changed_at: 'DESC' } });
  }
}
