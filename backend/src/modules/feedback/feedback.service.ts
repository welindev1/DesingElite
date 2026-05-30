import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { IsNumber, IsOptional, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() product_id?: number;
  @ApiProperty({ example: 5 }) @IsNumber() @Min(1) @Max(5) rating: number;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(1000) comment: string;
}

@Injectable()
export class FeedbackService {
  constructor(@InjectRepository(Feedback) private repo: Repository<Feedback>) {}

  async findPublic() {
    return this.repo.find({ where: { is_visible: true }, order: { is_featured: 'DESC', created_at: 'DESC' } });
  }

  async findAll(params?: { page?: number; limit?: number; search?: string; visibility?: string; featured?: string }) {
    const { page = 1, limit = 20, search, visibility, featured } = params || {};

    const qb = this.repo.createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.product', 'product');

    if (search) {
      qb.andWhere('(user.username ILIKE :search OR feedback.comment ILIKE :search)', { search: `%${search}%` });
    }
    if (visibility === 'visible') qb.andWhere('feedback.is_visible = true');
    if (visibility === 'hidden') qb.andWhere('feedback.is_visible = false');
    if (featured === 'true') qb.andWhere('feedback.is_featured = true');

    const total = await qb.getCount();
    const data = await qb
      .orderBy('feedback.is_featured', 'DESC')
      .addOrderBy('feedback.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const [total, visible, featured, avgRating] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { is_visible: true } }),
      this.repo.count({ where: { is_featured: true } }),
      this.repo.createQueryBuilder('feedback')
        .select('COALESCE(AVG(feedback.rating), 0)', 'avg')
        .getRawOne(),
    ]);
    return { total, visible, hidden: total - visible, featured, avgRating: parseFloat(parseFloat(avgRating?.avg || '0').toFixed(1)) };
  }

  async create(userId: number, dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.repo.create({ user_id: userId, product_id: dto.product_id || null, rating: dto.rating, comment: dto.comment });
    return this.repo.save(feedback);
  }

  async delete(id: number, userId: number): Promise<void> {
    const feedback = await this.repo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    if (feedback.user_id !== userId) throw new ForbiddenException('Not your feedback');
    await this.repo.remove(feedback);
  }

  async toggleVisibility(id: number): Promise<Feedback> {
    const feedback = await this.repo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    feedback.is_visible = !feedback.is_visible;
    return this.repo.save(feedback);
  }

  async toggleFeatured(id: number): Promise<Feedback> {
    const feedback = await this.repo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    feedback.is_featured = !feedback.is_featured;
    return this.repo.save(feedback);
  }

  async adminDelete(id: number): Promise<void> {
    const feedback = await this.repo.findOne({ where: { id } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    await this.repo.remove(feedback);
  }
}
