import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { ProductsModule } from './modules/products/products.module';
import { PlansModule } from './modules/plans/plans.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { BotModule } from './modules/bot/bot.module';
import { MtaModule } from './modules/mta/mta.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { StatsModule } from './modules/stats/stats.module';
import { SettingsModule } from './modules/settings/settings.module';

// Entities
import { User } from './modules/users/entities/user.entity';
import { License } from './modules/licenses/entities/license.entity';
import { LicenseStatusHistory } from './modules/licenses/entities/license-status-history.entity';
import { Product } from './modules/products/entities/product.entity';
import { Plan } from './modules/plans/entities/plan.entity';
import { UserPlan } from './modules/plans/entities/user-plan.entity';
import { Purchase } from './modules/purchases/entities/purchase.entity';
import { Coupon } from './modules/coupons/entities/coupon.entity';
import { CouponUsage } from './modules/coupons/entities/coupon-usage.entity';
import { Feedback } from './modules/feedback/entities/feedback.entity';
import { Setting } from './modules/settings/entities/setting.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const entities = [User, License, LicenseStatusHistory, Product, Plan, UserPlan, Purchase, Coupon, CouponUsage, Feedback, Setting];
        const databaseUrl = cfg.get<string>('DATABASE_URL');
        if (databaseUrl) {
          const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
          return {
            type: 'postgres',
            url: databaseUrl,
            ...(isLocalhost ? {} : { ssl: { rejectUnauthorized: false } }),
            entities,
            synchronize: true,
          };
        }
        return {
          type: 'postgres',
          host: cfg.get('DB_HOST', 'localhost'),
          port: cfg.get<number>('DB_PORT', 5432),
          database: cfg.get('DB_NAME', 'welinstore'),
          username: cfg.get('DB_USER', 'postgres'),
          password: cfg.get('DB_PASS', 'postgres'),
          entities,
          synchronize: true,
          logging: cfg.get('NODE_ENV') === 'development',
        };
      },
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    AuthModule,
    UsersModule,
    LicensesModule,
    ProductsModule,
    PlansModule,
    PurchasesModule,
    CouponsModule,
    FeedbackModule,
    BotModule,
    MtaModule,
    DashboardModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
    StatsModule,
    SettingsModule,
  ],
})
export class AppModule {}
