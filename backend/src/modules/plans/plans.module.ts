import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlansPublicController, PlansAdminController } from './plans.controller';
import { PlansService } from './plans.service';
import { Plan } from './entities/plan.entity';
import { UserPlan } from './entities/user-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, UserPlan])],
  controllers: [PlansPublicController, PlansAdminController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
