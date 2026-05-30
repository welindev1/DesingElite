import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { License } from '../licenses/entities/license.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(License) private licenseRepo: Repository<License>,
  ) {}

  async getPublicStats() {
    const [totalUsers, totalProducts] = await Promise.all([
      this.userRepo.count(),
      this.productRepo.count({ where: { visible: true } }),
    ]);

    return {
      total_users: totalUsers,
      total_products: totalProducts,
    };
  }

  async getTopBuyers(limit = 5) {
    // Get users with most products in their license
    const licenses = await this.licenseRepo
      .createQueryBuilder('license')
      .leftJoinAndSelect('license.user', 'user')
      .getMany();

    // Count products per user
    const userProducts: { user: any; productCount: number }[] = [];

    for (const license of licenses) {
      if (license.user) {
        const products = license.products || [];
        userProducts.push({
          user: license.user,
          productCount: products.length,
        });
      }
    }

    // Sort by product count and take top N
    const sorted = userProducts
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);

    return sorted.map((item, index) => ({
      rank: index + 1,
      username: item.user.username,
      avatar: item.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user.username?.charAt(0) || 'U')}&background=${index === 0 ? 'c52828' : index === 1 ? '666' : index === 2 ? '555' : '333'}&color=fff&size=80&bold=true`,
      products_count: item.productCount,
    }));
  }
}
