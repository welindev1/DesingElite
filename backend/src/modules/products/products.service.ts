import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { PlansService } from '../plans/plans.service';
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, MinLength, MaxLength, ArrayMaxSize, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(255) short_description?: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiProperty({ enum: ProductCategory, default: ProductCategory.SCRIPTS, required: false })
  @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
  @ApiProperty({ description: 'Imagen principal (Imgur)', example: 'https://i.imgur.com/AbCdEfG.png', required: false })
  @IsOptional() @IsString() image?: string;
  @ApiProperty({ description: 'Galería de imágenes (max 10 links)', type: [String], required: false })
  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(10) gallery_images?: string[];
  @ApiProperty({ description: 'Video de YouTube', required: false })
  @IsOptional() @IsString() video_url?: string;
  @ApiProperty({ description: 'Link de descarga (Drive, Mega, etc.)', required: false })
  @IsOptional() @IsString() download_link?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() visible?: boolean;
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(255) short_description?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(10) gallery_images?: string[];
  @IsOptional() @IsString() video_url?: string;
  @IsOptional() @IsString() download_link?: string;
  @IsOptional() @IsBoolean() visible?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private plansService: PlansService,
  ) {}

  async findAll(includeHidden = false): Promise<Product[]> {
    const where: any = {};
    if (!includeHidden) where.visible = true;

    // Obtener productos
    const products = await this.repo.find({ where, order: { sort_order: 'DESC', created_at: 'DESC' } });

    // Obtener planes activos y convertirlos a formato de producto
    const plans = await this.plansService.findAll(true);
    const plansAsProducts: Product[] = plans.map(plan => {
      // Determinar sort_order: "Tienda Completa" = 9999, otros planes = 1000 + su sort_order
      let sortOrder = plan.sort_order || 0;
      if (plan.name.toLowerCase().includes('tienda completa')) {
        sortOrder = 9999;
      } else if (sortOrder < 1000) {
        sortOrder = 1000 + sortOrder;
      }

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        short_description: plan.description || `Plan de ${plan.duration_days} días`,
        price: plan.price,
        category: ProductCategory.PLANS,
        image: plan.image,
        gallery_images: [],
        video_url: null,
        download_link: null,
        visible: plan.is_active,
        sort_order: sortOrder,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
        _isPlan: true,
        _planId: plan.id,
        _durationDays: plan.duration_days,
      } as Product & { _isPlan: boolean; _planId: number; _durationDays: number };
    });

    // Combinar y ordenar: planes primero (sort_order alto), luego productos
    const combined = [...plansAsProducts, ...products];
    combined.sort((a, b) => {
      if (b.sort_order !== a.sort_order) return b.sort_order - a.sort_order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return combined;
  }

  async findAllPaginated(params?: { page?: number; limit?: number; search?: string; visible?: boolean }) {
    const { page = 1, limit = 20, search, visible } = params || {};
    const where: any = {};
    if (visible !== undefined) where.visible = visible;
    if (search) where.name = ILike(`%${search}%`);
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { sort_order: 'DESC', created_at: 'DESC' },
    });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: number, includeDownloadLink = false): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (!includeDownloadLink) {
      const { download_link, ...rest } = product;
      return rest as Product;
    }
    return product;
  }

  async findByIds(ids: number[], includeDownloadLink = false): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const products = await this.repo.findByIds(ids);
    if (!includeDownloadLink) {
      return products.map(({ download_link, ...rest }) => rest as Product);
    }
    return products;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.repo.create({ ...dto, gallery_images: dto.gallery_images || [] });
    return this.repo.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async delete(id: number): Promise<void> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.repo.remove(product);
  }

  async toggleVisibility(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    product.visible = !product.visible;
    return this.repo.save(product);
  }
}
