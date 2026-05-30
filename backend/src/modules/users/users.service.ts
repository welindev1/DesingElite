import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Product } from '../products/entities/product.entity';
import { Purchase } from '../purchases/entities/purchase.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Purchase) private purchaseRepo: Repository<Purchase>,
    @Inject(forwardRef(() => LicensesService)) private licensesService: LicensesService,
    @Inject(forwardRef(() => PlansService)) private plansService: PlansService,
    private notificationsService: NotificationsService,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id: id as any } });
  }

  async findByIdWithDetails(id: number): Promise<any> {
    const user = await this.repo.findOne({ where: { id: id as any } });
    if (!user) throw new NotFoundException('User not found');

    // Get license with enriched products
    const license = await this.licensesService.findByUserId(id);
    let licenseData = null;
    if (license) {
      const productIds = (license.products || []).map(p => p.product_id);
      let productsInfo: Product[] = [];
      if (productIds.length > 0) {
        productsInfo = await this.productRepo.find({ where: { id: In(productIds) } });
      }
      licenseData = {
        id: license.id,
        key: license.license_key,
        status: license.status,
        server_ip: license.authorized_ip,
        server_port: license.authorized_port,
        last_used: license.last_used,
        status_reason: license.status_reason,
        products: (license.products || []).map(lp => {
          // Convert both to string for comparison (bigint comes as string from DB)
          const productInfo = productsInfo.find(p => String(p.id) === String(lp.product_id));
          return {
            id: lp.product_id,
            name: productInfo?.name ?? 'Producto desconocido',
            image: productInfo?.image,
            expires_at: lp.expires_at,
            added_at: lp.added_at,
          };
        }),
      };
    }

    // Get purchases using query builder for bigint compatibility
    const purchases = await this.purchaseRepo
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.product', 'product')
      .leftJoinAndSelect('purchase.plan', 'plan')
      .where('purchase.user_id = :userId', { userId: id })
      .orderBy('purchase.created_at', 'DESC')
      .take(10)
      .getMany();

    // Get user's active plans
    const activePlans = await this.plansService.getUserActivePlans(id);
    const plansData = activePlans.map(up => ({
      id: up.id,
      plan_id: up.plan_id,
      plan_name: up.plan?.name || 'Plan desconocido',
      plan_image: up.plan?.image,
      starts_at: up.starts_at,
      expires_at: up.expires_at,
      days_remaining: Math.max(0, Math.ceil((new Date(up.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    }));

    return {
      ...user,
      license: licenseData,
      plans: plansData,
      purchases: purchases.map(p => ({
        id: p.id,
        type: p.purchase_type,
        item_id: p.product_id || p.plan_id,
        item_name: p.product?.name || p.plan?.name || 'Desconocido',
        amount: p.price_paid,
        status: p.payment_status,
        created_at: p.created_at,
      })),
    };
  }

  async findByDiscordId(discordId: string): Promise<User | null> {
    return this.repo.findOne({ where: { discord_id: discordId } });
  }

  async findAll(params?: { page?: number; limit?: number; search?: string; status?: UserStatus }) {
    const { page = 1, limit = 20, search, status } = params || {};
    const where: any = {};
    if (status) where.status = status;
    if (search) where.username = ILike(`%${search}%`);
    const [data, total] = await this.repo.findAndCount({
      where, skip: (page - 1) * limit, take: limit, order: { created_at: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async update(id: number, data: Partial<User>, changedBy?: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const previousRole = user.role;
    Object.assign(user, data);
    const savedUser = await this.repo.save(user);

    // Send webhook for role change
    if (data.role && data.role !== previousRole) {
      this.notificationsService.sendUserLog({
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        changeType: 'role',
        previousValue: previousRole,
        newValue: data.role,
        changedBy,
      }).catch(() => {});
    }

    return savedUser;
  }

  async changeStatus(id: number, status: UserStatus, changedBy?: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const previousStatus = user.status;
    user.status = status;
    const savedUser = await this.repo.save(user);

    // Send webhook for status change
    this.notificationsService.sendUserLog({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      changeType: 'status',
      previousValue: previousStatus,
      newValue: status,
      changedBy,
    }).catch(() => {});

    return savedUser;
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    await this.repo.remove(user);
  }
}
