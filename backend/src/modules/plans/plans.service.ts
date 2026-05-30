import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { addDays } from 'date-fns';
import { Plan } from './entities/plan.entity';
import { UserPlan, UserPlanStatus } from './entities/user-plan.entity';
import { IsString, IsOptional, IsNumber, IsPositive, IsArray, Min, Max, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty() @IsString() @MinLength(3) @MaxLength(100) name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MaxLength(500) image?: string;
  @ApiProperty() @IsNumber() @IsPositive() price: number;
  @ApiProperty({ required: false, default: 30 }) @IsOptional() @IsNumber() @Min(1) @Max(365) duration_days?: number;
  @ApiProperty({ type: [Number], example: [2, 4, 6], required: false }) @IsOptional() @IsArray() @IsNumber({}, { each: true }) product_ids?: number[];
  @ApiProperty({ required: false, default: 0, description: 'Orden de visualización (mayor = más arriba)' }) @IsOptional() @IsNumber() sort_order?: number;
}

export class UpdatePlanDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(100) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(500) image?: string;
  @IsOptional() @IsNumber() @IsPositive() price?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(365) duration_days?: number;
  @IsOptional() @IsArray() @IsNumber({}, { each: true }) product_ids?: number[];
  @IsOptional() @IsBoolean() is_active?: boolean;
  @IsOptional() @IsNumber() sort_order?: number;
}

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private plansRepo: Repository<Plan>,
    @InjectRepository(UserPlan) private userPlansRepo: Repository<UserPlan>,
  ) {}

  async findAll(activeOnly = true): Promise<Plan[]> {
    const where: any = {};
    if (activeOnly) where.is_active = true;
    return this.plansRepo.find({ where, order: { sort_order: 'DESC', price: 'ASC' } });
  }

  async findById(id: number): Promise<Plan> {
    const plan = await this.plansRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.plansRepo.create({
      ...dto,
      duration_days: dto.duration_days || 30,
      product_ids: dto.product_ids || [],
      sort_order: dto.sort_order || 0,
    });
    return this.plansRepo.save(plan);
  }

  async update(id: number, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findById(id);
    Object.assign(plan, dto);
    return this.plansRepo.save(plan);
  }

  async delete(id: number): Promise<void> {
    const plan = await this.findById(id);
    await this.plansRepo.remove(plan);
  }

  async hasProductViaPlan(userId: number, productId: number): Promise<boolean> {
    const activePlans = await this.userPlansRepo.find({
      where: { user_id: userId, status: UserPlanStatus.ACTIVE, expires_at: MoreThan(new Date()) },
      relations: ['plan'],
    });
    return activePlans.some((up) => (up.plan?.product_ids || []).includes(productId));
  }

  async assignPlan(userId: number, planId: number, assignedBy: 'admin' | 'purchase' = 'admin'): Promise<UserPlan> {
    const plan = await this.findById(planId);
    const existing = await this.userPlansRepo.findOne({
      where: { user_id: userId, plan_id: planId, status: UserPlanStatus.ACTIVE },
    });
    if (existing) {
      existing.expires_at = addDays(new Date(existing.expires_at), plan.duration_days);
      existing.assigned_by = assignedBy;
      return this.userPlansRepo.save(existing);
    }
    return this.userPlansRepo.save({
      user_id: userId, plan_id: planId,
      starts_at: new Date(), expires_at: addDays(new Date(), plan.duration_days),
      status: UserPlanStatus.ACTIVE,
      assigned_by: assignedBy,
    });
  }

  async getUserActivePlans(userId: number): Promise<UserPlan[]> {
    return this.userPlansRepo.find({
      where: { user_id: userId, status: UserPlanStatus.ACTIVE, expires_at: MoreThan(new Date()) },
      relations: ['plan'],
    });
  }

  async removePlan(userId: number, planId: number): Promise<void> {
    const userPlan = await this.userPlansRepo.findOne({
      where: { user_id: userId, plan_id: planId, status: UserPlanStatus.ACTIVE },
    });
    if (!userPlan) throw new NotFoundException('User plan not found');
    userPlan.status = UserPlanStatus.CANCELLED;
    await this.userPlansRepo.save(userPlan);
  }

  async getExpiredPlans(): Promise<UserPlan[]> {
    return this.userPlansRepo
      .createQueryBuilder('up')
      .leftJoinAndSelect('up.user', 'user')
      .leftJoinAndSelect('up.plan', 'plan')
      .where('up.status = :status', { status: UserPlanStatus.ACTIVE })
      .andWhere('up.expires_at < NOW()')
      .getMany();
  }

  async expireOldPlans(): Promise<{ expired: number; adminAssigned: number; purchaseAssigned: number }> {
    const expiredPlans = await this.getExpiredPlans();

    let adminAssigned = 0;
    let purchaseAssigned = 0;

    for (const plan of expiredPlans) {
      // Currently both admin and purchase assigned plans expire the same way
      // PayPal doesn't have auto-renew implemented, so all plans expire
      if (plan.assigned_by === 'admin') {
        adminAssigned++;
      } else {
        purchaseAssigned++;
      }

      plan.status = UserPlanStatus.EXPIRED;
      await this.userPlansRepo.save(plan);
    }

    return {
      expired: expiredPlans.length,
      adminAssigned,
      purchaseAssigned,
    };
  }
}
