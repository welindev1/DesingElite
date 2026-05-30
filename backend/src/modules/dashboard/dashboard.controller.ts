import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsIP, IsNumber, Min, Max } from 'class-validator';
import { DashboardService } from './dashboard.service';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

class UpdateNetworkDto {
  @IsIP() authorized_ip: string;
  @IsNumber() @Min(1) @Max(65535) authorized_port: number;
}

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private licensesService: LicensesService,
    private plansService: PlansService,
  ) {}

  @Get() @ApiOperation({ summary: 'Resumen del dashboard' })
  async getDashboard(@CurrentUser() user: User) { return this.dashboardService.getDashboard(user.id); }

  @Get('products') @ApiOperation({ summary: 'Mis productos activos' })
  async getMyProducts(@CurrentUser() user: User) {
    const license = await this.licensesService.findByUserId(user.id);
    if (!license) return { individual: [], via_plans: [] };
    const individual = this.licensesService.getActiveProducts(license);
    const activePlans = await this.plansService.getUserActivePlans(user.id);
    return { individual, via_plans: activePlans.flatMap((up) => up.plan?.product_ids || []) };
  }

  @Get('plans') @ApiOperation({ summary: 'Mis planes activos' })
  async getMyPlans(@CurrentUser() user: User) { return this.plansService.getUserActivePlans(user.id); }

  @Patch('license/network') @ApiOperation({ summary: 'Actualizar IP y puerto de mi licencia' })
  async updateNetwork(@CurrentUser() user: User, @Body() dto: UpdateNetworkDto) {
    return this.licensesService.updateNetworkConfig(user.id, dto.authorized_ip, dto.authorized_port);
  }
}
