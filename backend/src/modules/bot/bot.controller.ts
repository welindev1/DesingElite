import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiHeader } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsPositive, Min, Max, MaxLength, IsBoolean } from 'class-validator';
import { BotAuthGuard } from '../../common/guards/bot-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { BotService } from './bot.service';
import { LicenseStatus } from '../licenses/entities/license.entity';

class AddProductDto {
  @IsString() @IsNotEmpty() discord_id: string;
  @IsNumber() @IsPositive() product_id: number;
  @IsOptional() @IsNumber() @Min(1) @Max(365) days?: number;
}
class RemoveProductDto { @IsString() @IsNotEmpty() discord_id: string; @IsNumber() @IsPositive() product_id: number; }
class AddPlanDto { @IsString() @IsNotEmpty() discord_id: string; @IsNumber() @IsPositive() plan_id: number; }
class SetLicenseStatusDto {
  @IsString() @IsNotEmpty() discord_id: string;
  @IsEnum(LicenseStatus) status: LicenseStatus;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}
class CreateCouponDto {
  @IsString() @IsNotEmpty() code: string;
  @IsNumber() @IsPositive() discount: number;
  @IsOptional() @IsBoolean() is_percentage?: boolean;
  @IsOptional() @IsNumber() @Min(1) @Max(365) days_valid?: number;
}
class BanUserDto {
  @IsString() @IsNotEmpty() discord_id: string;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

@ApiTags('Bot')
@Controller('bot')
export class BotController {
  constructor(private botService: BotService) {}

  // TEST ENDPOINT - BORRAR DESPUÉS
  @Public()
  @Get('test-env')
  @ApiOperation({ summary: 'Test env variable (BORRAR)' })
  testEnv() {
    const secret = process.env.BOT_API_SECRET;
    return {
      exists: !!secret,
      length: secret?.length || 0,
      preview: secret ? secret.substring(0, 15) + '...' : 'NOT SET',
    };
  }

  @Public()
  @Post('add-product')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Agregar producto a usuario (days=null → permanente)' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async addProduct(@Body() dto: AddProductDto) { return this.botService.addProductToUser(dto); }

  @Public()
  @Post('remove-product')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Remover producto de usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async removeProduct(@Body() dto: RemoveProductDto) { return this.botService.removeProductFromUser(dto.discord_id, dto.product_id); }

  @Public()
  @Post('add-plan')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Asignar plan a usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async addPlan(@Body() dto: AddPlanDto) { return this.botService.addPlanToUser(dto.discord_id, dto.plan_id); }

  @Public()
  @Post('set-license-status')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Cambiar estado de licencia' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async setLicenseStatus(@Body() dto: SetLicenseStatusDto) { return this.botService.setLicenseStatus(dto); }

  @Public()
  @Get('user/:discordId')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Info completa de usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async getUserInfo(@Param('discordId') discordId: string) { return this.botService.getUserByDiscordId(discordId); }

  @Public()
  @Get('user/:discordId/products')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Productos y planes activos del usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async getUserProducts(@Param('discordId') discordId: string) { return this.botService.getUserProducts(discordId); }

  @Public()
  @Get('products')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async listProducts() { return this.botService.listProducts(); }

  @Public()
  @Get('plans')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Listar todos los planes' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async listPlans() { return this.botService.listPlans(); }

  @Public()
  @Post('coupons')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Crear cupón rápido' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async createCoupon(@Body() dto: CreateCouponDto) { return this.botService.createCoupon(dto); }

  @Public()
  @Post('ban')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Banear usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async banUser(@Body() dto: BanUserDto) { return this.botService.banUser(dto.discord_id, dto.reason); }

  @Public()
  @Post('unban')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Desbanear usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async unbanUser(@Body() dto: { discord_id: string }) { return this.botService.unbanUser(dto.discord_id); }

  @Public()
  @Get('stats')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Estadísticas del dashboard' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async getStats() { return this.botService.getStats(); }

  @Public()
  @Post('remove-plan')
  @UseGuards(BotAuthGuard)
  @ApiOperation({ summary: 'Quitar plan de usuario' })
  @ApiSecurity('BotSecret')
  @ApiHeader({ name: 'X-Bot-Secret', required: true })
  async removePlan(@Body() dto: { discord_id: string; plan_id: number }) { return this.botService.removePlanFromUser(dto.discord_id, dto.plan_id); }
}
