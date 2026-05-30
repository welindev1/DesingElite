import { Injectable, NotFoundException } from '@nestjs/common';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { CouponsService } from '../coupons/coupons.service';
import { AdminService } from '../admin/admin.service';
import { LicenseStatus } from '../licenses/entities/license.entity';
import { UserStatus } from '../users/entities/user.entity';
import { DiscountType } from '../coupons/entities/coupon.entity';

@Injectable()
export class BotService {
  constructor(
    private licensesService: LicensesService,
    private plansService: PlansService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private couponsService: CouponsService,
    private adminService: AdminService,
  ) {}

  async addProductToUser(dto: { discord_id: string; product_id: number; days?: number }) {
    const user = await this.usersService.findByDiscordId(dto.discord_id);
    if (!user) throw new NotFoundException('User not found');
    const license = await this.licensesService.addProduct(user.id, dto.product_id, dto.days, 'bot');
    return {
      message: 'Product added successfully',
      discord_id: user.discord_id,
      product_id: dto.product_id,
      expires_at: dto.days ? `${dto.days} days` : 'permanent',
      license_key: license.license_key,
    };
  }

  async removeProductFromUser(discord_id: string, product_id: number) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');
    await this.licensesService.removeProduct(user.id, product_id);
    return { message: 'Product removed successfully', discord_id, product_id };
  }

  async addPlanToUser(discord_id: string, plan_id: number) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');
    const userPlan = await this.plansService.assignPlan(user.id, plan_id);
    return { message: 'Plan assigned successfully', discord_id, plan_id, expires_at: userPlan.expires_at };
  }

  async setLicenseStatus(dto: { discord_id: string; status: LicenseStatus; reason?: string }) {
    const user = await this.usersService.findByDiscordId(dto.discord_id);
    if (!user) throw new NotFoundException('User not found');
    const license = await this.licensesService.changeStatus(user.id, dto.status, dto.reason);
    return { message: 'License status updated', discord_id: dto.discord_id, new_status: dto.status, license_key: license.license_key };
  }

  async getUserByDiscordId(discord_id: string) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');
    const license = await this.licensesService.findByUserId(user.id);
    const activePlans = await this.plansService.getUserActivePlans(user.id);
    return {
      user,
      license: license ? {
        key: license.license_key, status: license.status,
        products_count: (license.products || []).length,
        active_products_count: this.licensesService.getActiveProducts(license).length,
        last_used: license.last_used,
      } : null,
      active_plans: activePlans.length,
    };
  }

  async getUserProducts(discord_id: string) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');
    const license = await this.licensesService.findByUserId(user.id);
    if (!license) return { products: [], plans: [] };
    const activeProducts = this.licensesService.getActiveProducts(license);
    const activePlans = await this.plansService.getUserActivePlans(user.id);
    return {
      discord_id,
      license_key: license.license_key,
      license_status: license.status,
      individual_products: activeProducts,
      plans: activePlans.map((up) => ({
        plan_id: up.plan_id, plan_name: up.plan?.name,
        expires_at: up.expires_at, product_ids: up.plan?.product_ids,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // NUEVOS MÉTODOS PARA BOT
  // ═══════════════════════════════════════════════════════════════════

  async listProducts() {
    const products = await this.productsService.findAll();
    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      is_active: p.visible,
    }));
  }

  async listPlans() {
    const plans = await this.plansService.findAll(false); // incluir inactivos
    return plans.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      duration_days: p.duration_days,
      is_active: p.is_active,
    }));
  }

  async createCoupon(dto: { code: string; discount: number; is_percentage?: boolean; days_valid?: number }) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (dto.days_valid || 30));

    const coupon = await this.couponsService.create({
      code: dto.code.toUpperCase(),
      discount_type: (dto.is_percentage ?? true) ? DiscountType.PERCENTAGE : DiscountType.FIXED,
      discount_value: dto.discount,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    return {
      message: 'Coupon created successfully',
      id: coupon.id,
      code: coupon.code,
      discount: dto.is_percentage ? `${dto.discount}%` : `$${dto.discount}`,
      expires_at: endDate.toISOString(),
    };
  }

  async banUser(discord_id: string, reason?: string) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersService.changeStatus(user.id, UserStatus.BANNED, 'Bot');

    // También suspender la licencia
    try {
      await this.licensesService.changeStatus(user.id, LicenseStatus.SUSPENDED, reason || 'Banned by bot');
    } catch {}

    return {
      message: 'User banned successfully',
      discord_id,
      username: user.username,
      reason: reason || 'No reason provided',
    };
  }

  async unbanUser(discord_id: string) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersService.changeStatus(user.id, UserStatus.ACTIVE, 'Bot');

    // También reactivar la licencia
    try {
      await this.licensesService.changeStatus(user.id, LicenseStatus.ACTIVE, 'Unbanned by bot');
    } catch {}

    return {
      message: 'User unbanned successfully',
      discord_id,
      username: user.username,
    };
  }

  async getStats() {
    return this.adminService.getStats();
  }

  async removePlanFromUser(discord_id: string, plan_id: number) {
    const user = await this.usersService.findByDiscordId(discord_id);
    if (!user) throw new NotFoundException('User not found');
    await this.plansService.removePlan(user.id, plan_id);
    return { message: 'Plan removed successfully', discord_id, plan_id };
  }
}
