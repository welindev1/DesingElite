import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';
import { PlansService, CreatePlanDto, UpdatePlanDto } from './plans.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

class AssignPlanDto {
  @IsNumber() @IsPositive() user_id: number;
  @IsNumber() @IsPositive() plan_id: number;
}

@ApiTags('Plans (Public)')
@Controller('plans')
export class PlansPublicController {
  constructor(private plansService: PlansService) {}

  @Public() @Get() @ApiOperation({ summary: 'Listar planes activos' })
  async findAll() { return this.plansService.findAll(true); }

  @Public() @Get(':id') @ApiOperation({ summary: 'Detalle de plan' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.plansService.findById(id); }
}

@ApiTags('Admin - Plans')
@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class PlansAdminController {
  constructor(private plansService: PlansService) {}

  @Get() @ApiOperation({ summary: '[ADMIN] Listar todos los planes' })
  async findAll() { return this.plansService.findAll(false); }

  @Get(':id') @ApiOperation({ summary: '[ADMIN] Obtener plan por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.plansService.findById(id); }

  @Post() @ApiOperation({ summary: '[ADMIN] Crear plan' })
  async create(@Body() dto: CreatePlanDto) { return this.plansService.create(dto); }

  @Patch(':id') @ApiOperation({ summary: '[ADMIN] Actualizar plan' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: '[ADMIN] Eliminar plan' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.plansService.delete(id);
    return { message: 'Plan deleted successfully' };
  }

  @Post('assign') @ApiOperation({ summary: '[ADMIN] Asignar plan a usuario' })
  async assign(@Body() dto: AssignPlanDto) { return this.plansService.assignPlan(dto.user_id, dto.plan_id); }

  @Delete(':userId/remove/:planId') @ApiOperation({ summary: '[ADMIN] Remover plan de usuario' })
  async removePlan(@Param('userId', ParseIntPipe) userId: number, @Param('planId', ParseIntPipe) planId: number) {
    await this.plansService.removePlan(userId, planId);
    return { message: 'Plan removed successfully' };
  }

  @Get('user/:userId') @ApiOperation({ summary: '[ADMIN] Obtener planes activos de usuario' })
  async getUserPlans(@Param('userId', ParseIntPipe) userId: number) {
    return this.plansService.getUserActivePlans(userId);
  }
}
