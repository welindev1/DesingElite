import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LicensesModule } from '../licenses/licenses.module';
import { PlansModule } from '../plans/plans.module';
import { PurchasesModule } from '../purchases/purchases.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [LicensesModule, PlansModule, PurchasesModule, ProductsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
