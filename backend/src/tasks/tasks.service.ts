import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlansService } from '../modules/plans/plans.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private plansService: PlansService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async updateExpiredPlans() {
    this.logger.debug('Checking expired plans...');
    const result = await this.plansService.expireOldPlans();

    if (result.expired > 0) {
      this.logger.log(
        `Expired ${result.expired} plans (Admin: ${result.adminAssigned}, Purchase: ${result.purchaseAssigned})`,
      );
    }
  }
}
