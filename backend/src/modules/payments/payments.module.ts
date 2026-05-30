import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PayPalConfig } from './paypal.config';
import { Purchase } from '../purchases/entities/purchase.entity';
import { LicensesModule } from '../licenses/licenses.module';
import { CouponsModule } from '../coupons/coupons.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase]),
    LicensesModule,
    CouponsModule,
    PlansModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayPalConfig],
  exports: [PaymentsService],
})
export class PaymentsModule {}
