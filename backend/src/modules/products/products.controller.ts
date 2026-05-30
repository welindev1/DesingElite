import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService, CreateProductDto, UpdateProductDto } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LicensesService } from '../licenses/licenses.service';
import { PlansService } from '../plans/plans.service';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Products (Public)')
@Controller('products')
export class ProductsPublicController {
  constructor(
    private productsService: ProductsService,
    private licensesService: LicensesService,
    private plansService: PlansService,
  ) {}

  @Public() @Get() @ApiOperation({ summary: 'Listar productos visibles' })
  async findAll() { return this.productsService.findAll(false); }

  @Public() @Get(':id') @ApiOperation({ summary: 'Detalle de producto (sin download_link)' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.productsService.findById(id, false); }

  @Get(':id/download') @UseGuards(JwtAuthGuard) @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener link de descarga (requiere acceso al producto)' })
  async getDownloadLink(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const license = await this.licensesService.findByUserId(user.id);
    let hasAccess = false;
    if (license && license.status === 'active') {
      hasAccess = this.licensesService.hasActiveProduct(license, id);
    }
    if (!hasAccess) hasAccess = await this.plansService.hasProductViaPlan(user.id, id);
    if (!hasAccess) throw new ForbiddenException('You do not have access to this product');
    const product = await this.productsService.findById(id, true);
    return { product_id: product.id, product_name: product.name, download_link: product.download_link };
  }
}

@ApiTags('Admin - Products')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT')
export class ProductsAdminController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: '[ADMIN] Listar todos los productos con paginación y búsqueda' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre' })
  @ApiQuery({ name: 'visible', required: false, type: Boolean, description: 'Filtrar por visibilidad' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('visible') visible?: string,
  ) {
    return this.productsService.findAllPaginated({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
      visible: visible !== undefined ? visible === 'true' : undefined,
    });
  }

  @Get(':id') @ApiOperation({ summary: '[ADMIN] Obtener producto completo con download_link' })
  async findOne(@Param('id', ParseIntPipe) id: number) { return this.productsService.findById(id, true); }

  @Post() @ApiOperation({ summary: '[ADMIN] Crear producto' })
  async create(@Body() dto: CreateProductDto) { return this.productsService.create(dto); }

  @Patch(':id') @ApiOperation({ summary: '[ADMIN] Actualizar producto' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id') @ApiOperation({ summary: '[ADMIN] Eliminar producto' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  @Patch(':id/visibility') @ApiOperation({ summary: '[ADMIN] Toggle visible/oculto' })
  async toggleVisibility(@Param('id', ParseIntPipe) id: number) { return this.productsService.toggleVisibility(id); }
}
