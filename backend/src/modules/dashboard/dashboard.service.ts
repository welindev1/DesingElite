import { Injectable } from '@nestjs/common';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { PurchasesService } from '../purchases/purchases.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class DashboardService {
  constructor(
    private licensesService: LicensesService,
    private plansService: PlansService,
    private purchasesService: PurchasesService,
    private productsService: ProductsService,
  ) {}

  async getDashboard(userId: number) {
    console.log('Dashboard - userId:', userId, 'type:', typeof userId);
    const license = await this.licensesService.findByUserId(userId);
    console.log('Dashboard - license found:', license ? license.license_key : 'NULL');
    const activePlans = await this.plansService.getUserActivePlans(userId);
    const purchases = await this.purchasesService.findByUser(userId);
    const activeProductsLicense = license ? this.licensesService.getActiveProducts(license) : [];
    const planProductIds = activePlans.flatMap((up) => up.plan?.product_ids || []);

    // Obtener IDs únicos de productos
    const individualIds = activeProductsLicense.map(p => p.product_id);
    const allProductIds = [...new Set([...individualIds, ...planProductIds])];

    // Obtener información completa de los productos (con download_link para usuarios autorizados)
    const productsInfo = await this.productsService.findByIds(allProductIds, true);

    return {
      license: license ? {
        key: license.license_key, status: license.status,
        authorized_ip: license.authorized_ip, authorized_port: license.authorized_port, last_used: license.last_used,
      } : null,
      products: {
        individual: individualIds,
        via_plans: planProductIds,
        details: productsInfo.map(p => ({
          id: p.id,
          name: p.name,
          image: p.image,
          download_link: p.download_link,
        })),
      },
      active_plans: activePlans.map((up) => {
        const planProductIds = up.plan?.product_ids || [];
        const planProducts = productsInfo.filter(p => planProductIds.includes(Number(p.id)));
        return {
          id: up.id,
          plan_id: up.plan_id,
          plan_name: up.plan?.name,
          plan_image: up.plan?.image,
          expires_at: up.expires_at,
          days_remaining: Math.max(0, Math.ceil((new Date(up.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
          products: planProducts.map(p => ({
            id: p.id,
            name: p.name,
            image: p.image,
            download_link: p.download_link,
          })),
        };
      }),
      purchases_count: purchases.length,
    };
  }
}
