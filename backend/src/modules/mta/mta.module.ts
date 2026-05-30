import { Module } from '@nestjs/common';
import { MtaController } from './mta.controller';
import { MtaService } from './mta.service';
import { LicensesModule } from '../licenses/licenses.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [LicensesModule, PlansModule],
  controllers: [MtaController],
  providers: [MtaService],
})
export class MtaModule {}
