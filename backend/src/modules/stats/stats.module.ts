import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { License } from '../licenses/entities/license.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, License])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
