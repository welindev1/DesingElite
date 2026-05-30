import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Purchase, PaymentStatus } from '../purchases/entities/purchase.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    @InjectRepository(Purchase) private purchasesRepo: Repository<Purchase>,
  ) {}

  async getStats() {
    const [
      totalRevenue,
      totalUsers,
      activeProducts,
      purchasesToday,
      purchasesWeek,
      purchasesMonth,
      salesChart,
      recentPurchases,
      recentUsers,
    ] = await Promise.all([
      this.getTotalRevenue(),
      this.getTotalUsers(),
      this.getActiveProducts(),
      this.getPurchasesByPeriod('today'),
      this.getPurchasesByPeriod('week'),
      this.getPurchasesByPeriod('month'),
      this.getSalesChart(),
      this.getRecentPurchases(),
      this.getRecentUsers(),
    ]);

    return {
      summary: {
        total_revenue: totalRevenue,
        total_users: totalUsers,
        active_products: activeProducts,
        purchases_today: purchasesToday,
        purchases_week: purchasesWeek,
        purchases_month: purchasesMonth,
      },
      sales_chart: salesChart,
      recent_purchases: recentPurchases,
      recent_users: recentUsers,
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.purchasesRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.price_paid), 0)', 'total')
      .where('p.payment_status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();
    return parseFloat(result.total) || 0;
  }

  private async getTotalUsers(): Promise<number> {
    return this.usersRepo.count();
  }

  private async getActiveProducts(): Promise<number> {
    return this.productsRepo.count({ where: { visible: true } });
  }

  private async getPurchasesByPeriod(period: 'today' | 'week' | 'month'): Promise<{ count: number; revenue: number }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const result = await this.purchasesRepo
      .createQueryBuilder('p')
      .select('COUNT(*)::int', 'count')
      .addSelect('COALESCE(SUM(p.price_paid), 0)', 'revenue')
      .where('p.payment_status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.created_at >= :startDate', { startDate })
      .getRawOne();

    return {
      count: parseInt(result.count) || 0,
      revenue: parseFloat(result.revenue) || 0,
    };
  }

  private async getSalesChart(): Promise<{ date: string; revenue: number; count: number }[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.purchasesRepo
      .createQueryBuilder('p')
      .select("TO_CHAR(p.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(p.price_paid), 0)', 'revenue')
      .addSelect('COUNT(*)::int', 'count')
      .where('p.payment_status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('p.created_at >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy("TO_CHAR(p.created_at, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();

    // Fill missing dates with zero values
    const chartData: { date: string; revenue: number; count: number }[] = [];
    const dataMap = new Map(result.map(r => [r.date, { revenue: parseFloat(r.revenue), count: parseInt(r.count) }]));

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const data = dataMap.get(dateStr) || { revenue: 0, count: 0 };
      chartData.push({ date: dateStr, ...data });
    }

    return chartData;
  }

  private async getRecentPurchases() {
    const purchases = await this.purchasesRepo.find({
      where: { payment_status: PaymentStatus.COMPLETED },
      relations: ['user', 'product', 'plan'],
      order: { created_at: 'DESC' },
      take: 5,
    });

    return purchases.map(p => ({
      id: p.id,
      user: p.user ? { id: p.user.id, username: p.user.username, avatar: p.user.avatar } : null,
      item: p.product?.name || p.plan?.name || 'Unknown',
      type: p.purchase_type,
      amount: p.price_paid,
      created_at: p.created_at,
    }));
  }

  private async getRecentUsers() {
    const users = await this.usersRepo.find({
      order: { created_at: 'DESC' },
      take: 5,
    });

    return users.map(u => ({
      id: u.id,
      username: u.username,
      avatar: u.avatar,
      email: u.email,
      status: u.status,
      created_at: u.created_at,
    }));
  }
}
