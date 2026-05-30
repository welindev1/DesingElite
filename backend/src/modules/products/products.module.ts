import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsPublicController, ProductsAdminController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { LicensesModule } from '../licenses/licenses.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), LicensesModule, PlansModule],
  controllers: [ProductsPublicController, ProductsAdminController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
