import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MtaService } from './mta.service';
import { ValidateLicenseDto } from './dto/validate-license.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('MTA')
@Controller('mta')
export class MtaController {
  constructor(private mtaService: MtaService) {}

  @Public()
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar licencia desde script MTA (Lua)' })
  @ApiResponse({ status: 200, description: 'Licencia válida' })
  @ApiResponse({ status: 403, description: 'Licencia baneada/suspendida' })
  @ApiResponse({ status: 404, description: 'Licencia o producto no encontrado' })
  async validateLicense(@Body() dto: ValidateLicenseDto) {
    return this.mtaService.validateLicense(dto);
  }
}
