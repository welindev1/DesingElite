import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController, CheckoutController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchase.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Product])],
  controllers: [PurchasesController, CheckoutController],
  providers: [PurchasesService],
  exports: [PurchasesService],
})
export class PurchasesModule {}
