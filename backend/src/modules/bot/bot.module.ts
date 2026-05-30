import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BotAuthGuard } from '../../common/guards/bot-auth.guard';
import { LicensesModule } from '../licenses/licenses.module';
import { PlansModule } from '../plans/plans.module';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { CouponsModule } from '../coupons/coupons.module';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [LicensesModule, PlansModule, UsersModule, ProductsModule, CouponsModule, AdminModule],
  controllers: [BotController],
  providers: [BotService, BotAuthGuard],
})
export class BotModule {}
