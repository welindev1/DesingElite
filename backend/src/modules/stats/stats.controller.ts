import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { StatsService } from './stats.service';

@ApiTags('Public Stats')
@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Obtener estadísticas públicas (total usuarios, productos)' })
  async getPublicStats() {
    return this.statsService.getPublicStats();
  }

  @Public()
  @Get('top-buyers')
  @ApiOperation({ summary: 'Obtener top 5 compradores' })
  async getTopBuyers() {
    return this.statsService.getTopBuyers(5);
  }
}
