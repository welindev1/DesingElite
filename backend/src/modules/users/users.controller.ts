import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, UserStatus } from './entities/user.entity';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Listar usuarios' })
  @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false }) @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string, @Query('status') status?: UserStatus) {
    return this.usersService.findAll({ page, limit, search, status });
  }

  @Get(':id') @ApiOperation({ summary: '[ADMIN] Obtener usuario por ID con licencia, productos y compras' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.usersService.findByIdWithDetails(id); }

  @Patch(':id') @ApiOperation({ summary: '[ADMIN] Actualizar usuario' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: Partial<{ username: string; email: string; role: UserRole }>, @CurrentUser() admin: any) {
    return this.usersService.update(id, body, admin?.username);
  }

  @Patch(':id/status') @ApiOperation({ summary: '[ADMIN] Cambiar estado del usuario' })
  async changeStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: UserStatus }, @CurrentUser() admin: any) {
    return this.usersService.changeStatus(id, body.status, admin?.username);
  }

  @Patch(':id/role') @ApiOperation({ summary: '[ADMIN] Cambiar rol del usuario (admin/user)' })
  async changeRole(@Param('id', ParseIntPipe) id: number, @Body() body: { role: UserRole }, @CurrentUser() admin: any) {
    return this.usersService.update(id, { role: body.role }, admin?.username);
  }

  @Delete(':id') @ApiOperation({ summary: '[ADMIN] Eliminar usuario' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
